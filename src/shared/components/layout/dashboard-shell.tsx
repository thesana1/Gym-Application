import { type ReactNode } from 'react';

// Main content area for signed-in pages. Navigation lives in the left side nav.
type DashboardShellProps = { children: ReactNode };

export const DashboardShell = ({ children }: DashboardShellProps) => (
  <main className="min-w-0 flex-1 px-4 pb-12 pt-5 sm:px-6 lg:px-10 lg:pt-8">
    <div className="mx-auto w-full max-w-4xl">{children}</div>
  </main>
);
