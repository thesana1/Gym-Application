'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import { GoogleSignIn } from '@/features/auth/components/google-sign-in';
import { useGoogleLogin } from '@/features/auth/hooks/use-google-login';
import { useRegister } from '@/features/auth/hooks/use-register';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { SignUpSchema, SignUpType } from '@/features/auth/validations/auth.validation';
import { Button } from '@/shared/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { PasswordInput } from '@/shared/components/ui/password-input';
import { AUTH_COPY } from '@/shared/const/copy-public.const';

const copy = AUTH_COPY;

export const SignUpForm = ({ redirectTo }: { redirectTo?: string }) => {
  // New accounts go straight to the profile questions, which end with the Premium offer.
  const { register } = useRegister(redirectTo ?? '/dashboard/profile');
  const { loginWithGoogle } = useGoogleLogin(redirectTo ?? '/dashboard/profile');
  const { loading, error } = useAuthStore();
  const form = useForm<SignUpType>({ resolver: zodResolver(SignUpSchema), defaultValues: { fullName: '', email: '', password: '' } });

  return (
    <section aria-labelledby="sign-up-title" className="w-full max-w-md animate-rise">
      <h1 id="sign-up-title" className="text-3xl font-semibold">{copy.signUpTitle}</h1>
      <p className="mt-1 text-lg text-muted-foreground">{copy.signUpDescription}</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(register)} noValidate className="mt-6 flex flex-col gap-5">
          <FormField control={form.control} name="fullName" render={({ field }) => (
            <FormItem>
              <FormLabel>{copy.name}</FormLabel>
              <FormControl><Input autoComplete="name" placeholder={copy.namePlaceholder} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
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
                <PasswordInput autoComplete="new-password" showText={copy.show} hideText={copy.hide} showLabel={copy.showLabel}
                  hideLabel={copy.hideLabel} {...field} />
              </FormControl>
              <FormDescription>{copy.passwordHelp}</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
          {error && <p role="alert" className="text-base font-medium text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? copy.signingUp : copy.signUp}</Button>
          <GoogleSignIn disabled={loading} onClick={() => void loginWithGoogle()} />
          <p className="text-center text-base text-muted-foreground">
            {copy.haveAccount}{' '}
            <Link href={redirectTo ? `/sign-in?${new URLSearchParams({ callbackUrl: redirectTo })}` : '/sign-in'}
              className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline">
              {copy.toSignIn}
            </Link>
          </p>
        </form>
      </Form>
    </section>
  );
};
