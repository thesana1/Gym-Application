import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';

import { getFitnessProfileService } from '@/features/fitness/service/fitness-profile.service';
import { DashboardShell } from '@/shared/components/layout/dashboard-shell';
import { Header } from '@/shared/components/layout/header';
import { ONBOARDING_ROUTES } from '@/shared/const/routes.const';
import { auth } from '@/shared/lib/auth';
import { SessionProvider } from '@/shared/providers/session-provider';
import { StoreProvider } from '@/shared/providers/store-provider';

type SessionUser = { id?: string };

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;

  if (!session || !user?.id) redirect('/sign-in');

  // New members must answer the profile questions before using the rest of the app.
  const profile = await getFitnessProfileService(user.id);
  const onboarding = profile.data === null;
  if (onboarding && (await headers()).get('x-pathname') !== ONBOARDING_ROUTES.profile) redirect(ONBOARDING_ROUTES.profile);

  return (
    <SessionProvider>
      <StoreProvider>
        <div className="flex min-h-screen flex-col">
          <Header menu={!onboarding} />
          <DashboardShell>{children}</DashboardShell>
        </div>
      </StoreProvider>
    </SessionProvider>
  );
}
