import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import {
  translateStrings,
  loadTranslations,
  getMissingKeys,
} from './translationTools';

import { ComponentStrings, TranslationItem, Configuration } from '../types';

const execAsync = promisify(exec);

/**
 * Translates all the strings in a component to the target languages.
 * Saves the translations to the appropriate files.
 *
 * @param component - The component to translate.
 * @param config - The configuration object.
 * @returns A promise that resolves when the translations are complete.
 */
export async function translateComponent(
  component: ComponentStrings,
  config: Configuration
) {
  const { componentName } = component;
  const { baseLanguage, targetLanguages = [] } = config;

  //base translations for this component
  const baseTranslations = loadTranslations(
    componentName,
    baseLanguage,
    config
  );

  console.log('Translation items for', componentName);

  for (const targetLanguage of targetLanguages) {
    const existingTranslations = loadTranslations(
      componentName,
      targetLanguage,
      config
    );

    //filter out any existing translations
    const missingTranslations =
      getMissingKeys(
        { [componentName]: baseTranslations },
        { [componentName]: existingTranslations }
      )?.[componentName] || {};

    const translationItems: TranslationItem[] = Object.entries(
      missingTranslations
    ).map(([identifier, string]) => {
      return {
        componentName,
        original: string,
        identifier,
        translation: '',
        baseLanguage,
      };
    });

    if (translationItems.length === 0) {
      console.log(`No strings to translate for ${componentName}`);
    } else {
      console.log(
        `Translating ${translationItems.length} strings to ${targetLanguage}`
      );
      console.log(translationItems);
      const translated = await translateStrings(
        translationItems,
        targetLanguage
      );

      console.log(translated);

      config.targetLibrary.saveTranslations(translated, targetLanguage, config);
    }
  }
}

/**
 * Rewrites the component file with the updated translations.
 *
 * @param component - The component to rewrite.
 * @param config - The configuration object.
 * @returns A promise that resolves to true if the rewrite was successful.
 */
export async function rewriteComponent(
  component: ComponentStrings,
  config: Configuration
): Promise<boolean> {
  const { lintAfterRewrite, targetLibrary } = config;

  //if everything is already translated, we don't need to rewrite
  if (component.strings.every((s) => s.alreadyUpdated)) {
    console.log('Component already updated:', component.componentName);
    return true;
  }

  console.log('Rewriting component:', component.componentName);

  const source = fs.readFileSync(component.file, 'utf8');
  const updated = targetLibrary.updateSource(source, component.strings);

  try {
    fs.writeFileSync(
      component.file,
      lintAfterRewrite ? formatWithPrettier(updated) : updated
    );
  } catch (e) {
    console.error('Error writing file');
    console.error(e);
    return false;
  }

  if (lintAfterRewrite) {
    console.log('Linting with eslint --fix:', component.file);
    try {
      await execAsync(config.lintCommand(component.file));
    } catch (e) {
      console.error('Error running eslint --fix');
      console.error(e);
      return false;
    }
  }

  return true;
}

export function lintCommand(file: string): string {
  return `npx eslint --fix "${file}"`;
}

/**
 * Processes a component by translating and rewriting it.
 *
 * @param component - The component to process.
 * @param config - The configuration object.
 */
export async function processComponent(
  component: ComponentStrings,
  config: Configuration
) {
  await translateComponent(component, config);
  await rewriteComponent(component, config);
}

//whether eslint is enabled or not, we can still return something reasonable
//with prettier, without much cost
function formatWithPrettier(code: string): string {
  const prettierPath = path.resolve('./node_modules/.bin/prettier');

  try {
    return execSync(`${prettierPath} --parser typescript`, {
      input: code,
      encoding: 'utf-8',
    }).trim();
  } catch (e) {
    console.error('Error running prettier');
    console.error(e);
    return code;
  }
}
