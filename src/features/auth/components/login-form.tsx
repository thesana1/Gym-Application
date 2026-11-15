'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import { GoogleSignIn } from '@/features/auth/components/google-sign-in';
import { useGoogleLogin } from '@/features/auth/hooks/use-google-login';
import { useLogin } from '@/features/auth/hooks/use-login';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { LoginSchema, LoginType } from '@/features/auth/validations/auth.validation';
import { Button } from '@/shared/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { PasswordInput } from '@/shared/components/ui/password-input';
import { AUTH_ERROR_MESSAGES } from '@/shared/const/auth.const';
import { AUTH_COPY } from '@/shared/const/copy-public.const';

type LoginFormProps = { accountCreated?: boolean; redirectTo?: string; authError?: string };

const copy = AUTH_COPY;

export const LoginForm = ({ accountCreated = false, redirectTo, authError }: LoginFormProps) => {
  const { login } = useLogin(redirectTo);
  const { loginWithGoogle } = useGoogleLogin(redirectTo);
  const { loading, error } = useAuthStore();
  const message = error ?? (authError ? AUTH_ERROR_MESSAGES[authError] ?? copy.failed : null);
  const form = useForm<LoginType>({ resolver: zodResolver(LoginSchema), defaultValues: { email: '', password: '' } });

  return (
    <section aria-labelledby="sign-in-title" className="w-full max-w-md animate-rise">
      <h1 id="sign-in-title" className="text-3xl font-semibold">{copy.signInTitle}</h1>
      <p className="mt-1 text-lg text-muted-foreground">{copy.signInDescription}</p>
      {accountCreated && <p role="status" className="mt-5 rounded-xl bg-primary/10 p-4 text-base">{copy.accountCreated}</p>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(login)} noValidate className="mt-6 flex flex-col gap-5">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>{copy.email}</FormLabel>
              <FormControl>
                <Input autoComplete="email" inputMode="email" autoCapitalize="none" type="email" placeholder={copy.emailPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>{copy.password}</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="current-password" showText={copy.show} hideText={copy.hide} showLabel={copy.showLabel}
                  hideLabel={copy.hideLabel} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          {message && <p role="alert" className="text-base font-medium text-destructive">{message}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? copy.signingIn : copy.signIn}</Button>
          <GoogleSignIn disabled={loading} onClick={() => void loginWithGoogle()} />
          <p className="text-center text-base text-muted-foreground">
            {copy.noAccount}{' '}
            <Link href={redirectTo ? `/sign-up?${new URLSearchParams({ callbackUrl: redirectTo })}` : '/sign-up'}
              className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline">
              {copy.toSignUp}
            </Link>
          </p>
        </form>
      </Form>
    </section>
  );
};
