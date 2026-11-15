import { redirect } from 'next/navigation';

import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { SignUpForm } from '@/features/auth/components/signup-form';
import { auth } from '@/shared/lib/auth';
import { getAuthRedirect } from '@/shared/utils/auth-redirect';

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  const destination = getAuthRedirect(callbackUrl);
  if (await auth()) redirect(destination);
  return (
    <AuthPageShell>
      <SignUpForm redirectTo={destination} />
    </AuthPageShell>
  );
}
