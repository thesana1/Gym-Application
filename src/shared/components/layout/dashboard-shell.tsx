'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

import { MobileNavigation } from '@/shared/components/layout/mobile-navigation';
import { Sidebar } from '@/shared/components/layout/sidebar';
import { ONBOARDING_ROUTES } from '@/shared/const/routes.const';

// locked: hides navigation while a new member answers the first questions. The Premium offer page also hides it.
type DashboardShellProps = { children: ReactNode; locked?: boolean };

export const DashboardShell = ({ children, locked = false }: DashboardShellProps) => {
  const pathname = usePathname();
  const hideNavigation = locked || pathname === ONBOARDING_ROUTES.welcome;
  return (
    <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
      {!hideNavigation && <Sidebar className="hidden lg:flex" />}
      <main className="min-w-0 flex-1 px-4 pb-36 pt-5 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
        <div className="mx-auto w-full max-w-4xl">{children}</div>
      </main>
      {!hideNavigation && <MobileNavigation />}
    </div>
  );
};
