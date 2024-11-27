import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

import { updateSourceNo as updateSource } from '../src/utils/updateSource';
import { ComponentStrings } from '../src/types';

const registerComponentStrings: ComponentStrings = {
  componentName: 'RegisterPage',
  file: '',
  strings: [
    {
      file: path.resolve(__dirname, 'fixtures', 'RegisterPage.tsx'),
      componentName: 'RegisterPage',
      string: 'Sign Up',
      identifier: 'sign-up',
    },
    {
      file: path.resolve(__dirname, 'fixtures', 'RegisterPage.tsx'),
      componentName: 'RegisterPage',
      string: 'Create an account with your email and password',
      identifier: 'create-an-account-with-your',
    },
    {
      file: path.resolve(__dirname, 'fixtures', 'RegisterPage.tsx'),
      componentName: 'RegisterPage',
      string: 'Sign Up',
      identifier: 'sign-up',
    },
    {
      file: path.resolve(__dirname, 'fixtures', 'RegisterPage.tsx'),
      componentName: 'RegisterPage',
      string: 'Already have an account?',
      identifier: 'already-have-an-account',
    },
    {
      file: path.resolve(__dirname, 'fixtures', 'RegisterPage.tsx'),
      componentName: 'RegisterPage',
      string: 'Sign in',
      identifier: 'sign-in',
    },
    {
      file: path.resolve(__dirname, 'fixtures', 'RegisterPage.tsx'),
      componentName: 'RegisterPage',
      string: 'instead.',
      identifier: 'instead',
    },
  ],
};

const itemsComponentStrings: ComponentStrings = {
  componentName: 'Items',
  file: '',
  strings: [
    {
      file: '/Users/ed/Code/next-auto-intl/test/fixtures/Items.tsx',
      componentName: 'Items',
      string: 'Loading...',
      identifier: 'loading',
    },
    {
      file: '/Users/ed/Code/next-auto-intl/test/fixtures/Items.tsx',
      componentName: 'Items',
      string: 'Items',
      identifier: 'items',
    },
  ],
};

xdescribe('updateSourceFile', () => {
  it('should transform the Register Page properly', () => {
    const expectedOutputFile = path.resolve(
      __dirname,
      'fixtures',
      'RegisterPage.Transformed.tsx'
    );

    const expectedOutput = formattedSourceFile(expectedOutputFile);

    const transformedCode = transformPage();

    // Compare the formatted outputs
    expect(transformedCode).toEqual(expectedOutput);
  });

  it('should be idempotent', () => {
    const expectedOutputFile = path.resolve(
      __dirname,
      'fixtures',
      'RegisterPage.Transformed.tsx'
    );

    const expectedOutput = formattedSourceFile(expectedOutputFile);

    const transformedCode = transformPage();

    //transform it again, should not change
    const transformedCode2 = formatWithPrettier(
      updateSource(transformedCode, registerComponentStrings)
    );

    // Compare the formatted outputs
    expect(transformedCode2).toEqual(expectedOutput);
  });

  it('should transform partially-updated files correctly', () => {
    const expectedOutputFile = path.resolve(
      __dirname,
      'fixtures',
      'PartiallyUpdated.Transformed.tsx'
    );

    const expectedOutput = formattedSourceFile(expectedOutputFile);

    const transformedCode = transformPage('PartiallyUpdated.tsx');

    // Compare the formatted outputs
    expect(transformedCode).toEqual(expectedOutput);
  });

  it('should handle files with weird punctuation correctly', () => {
    const expectedOutputFile = path.resolve(
      __dirname,
      'fixtures',
      'Items.Transformed.tsx'
    );

    const expectedOutput = formattedSourceFile(expectedOutputFile);

    const transformedCode = transformPage('Items.tsx', itemsComponentStrings);

    // Compare the formatted outputs
    expect(transformedCode).toEqual(expectedOutput);
  });
});

function transformPage(
  fileName: string = 'RegisterPage.tsx',
  componentStrings = registerComponentStrings
): string {
  const inputFile = path.resolve(__dirname, 'fixtures', fileName);

  const inputCode = fs.readFileSync(inputFile, 'utf-8');

  // Run the transformation
  const transformedCode = updateSource(inputCode, registerComponentStrings);

  return formatWithPrettier(transformedCode);
}

function formattedSourceFile(filePath: string): string {
  return formatWithPrettier(fs.readFileSync(filePath, 'utf-8'));
}

// Helper to format code with Prettier via CLI
function formatWithPrettier(code: string): string {
  const prettierPath = path.resolve('./node_modules/.bin/prettier');
  return execSync(`${prettierPath} --parser typescript`, {
    input: code,
    encoding: 'utf-8',
  }).trim();
}
