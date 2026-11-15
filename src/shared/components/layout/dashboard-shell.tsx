import { type ReactNode } from 'react';

import { MobileNavigation } from '@/shared/components/layout/mobile-navigation';
import { Sidebar } from '@/shared/components/layout/sidebar';

type DashboardShellProps = { children: ReactNode };

export const DashboardShell = ({ children }: DashboardShellProps) => (
  <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
    <Sidebar className="hidden lg:flex" />
    <main className="min-w-0 flex-1 px-4 pb-36 pt-5 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
      <div className="mx-auto w-full max-w-2xl">{children}</div>
    </main>
    <MobileNavigation />
  </div>
);
