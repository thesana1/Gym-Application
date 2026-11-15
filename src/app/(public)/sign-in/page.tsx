import { redirect } from 'next/navigation';

import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { LoginForm } from '@/features/auth/components/login-form';
import { auth } from '@/shared/lib/auth';
import { getAuthRedirect } from '@/shared/utils/auth-redirect';

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ registered?: string; callbackUrl?: string; error?: string }> }) {
  const { registered, callbackUrl, error } = await searchParams;
  const destination = getAuthRedirect(callbackUrl);
  if (await auth()) redirect(destination);
  return (
    <AuthPageShell>
      <LoginForm accountCreated={registered === '1'} redirectTo={destination} authError={error} />
    </AuthPageShell>
  );
}
