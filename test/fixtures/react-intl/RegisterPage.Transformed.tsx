'use client';
import { FormattedMessage, useIntl } from 'react-intl';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AuthForm } from '@/components/custom/auth-form';
import { SubmitButton } from '@/components/custom/submit-button';

import { register, RegisterActionState } from '../actions';

export default function RegisterPage() {
  const intl = useIntl();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: 'idle',
    }
  );

  useEffect(() => {
    if (state.status === 'user_exists') {
      toast.error('Account already exists');
    } else if (state.status === 'failed') {
      toast.error('Failed to create account');
    } else if (state.status === 'invalid_data') {
      toast.error('Failed validating your submission!');
    } else if (state.status === 'success') {
      toast.success('Account created successfully');
      router.refresh();
    }
  }, [state, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">
            <FormattedMessage id="sign-up" defaultMessage="Sign Up" />
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            <FormattedMessage
              id="create-an-account-with-your"
              defaultMessage="Create an account with your email and password"
            />
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton>
            <FormattedMessage id="sign-up" defaultMessage="Sign Up" />
          </SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            <FormattedMessage
              id="already-have-an-account"
              defaultMessage="Already have an account?"
            />
            <Link
              href="/login"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              <FormattedMessage id="sign-in" defaultMessage="Sign in" />
            </Link>
            <FormattedMessage id="instead" defaultMessage="instead." />
          </p>
        </AuthForm>
      </div>
    </div>
  );
}