import { type ReactNode } from 'react';

import { Header } from '@/shared/components/layout/header';

type AuthPageShellProps = {
  children: ReactNode;
};

export const AuthPageShell = ({ children }: AuthPageShellProps) => {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex flex-1 items-start justify-center px-4 pb-12 pt-8 sm:pt-16">
        {children}
      </main>
    </div>
  );
};
