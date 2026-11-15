'use client';

import { Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import type { MembershipSummary } from '@/features/membership/types/membership.types';
import { AccountMenu } from '@/shared/components/layout/account-menu';
import { Button } from '@/shared/components/ui/button';
import { APP_NAME } from '@/shared/const/app.const';
import { COMMON_COPY } from '@/shared/const/copy-common.const';

type SessionUser = {
  name?: string | null;
  avatar?: string | null;
  membership?: MembershipSummary | null;
};

export const Header = () => {
  const { data: session, status } = useSession();
  const user = session?.user as SessionUser | undefined;
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 flex min-w-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur
      sm:px-6 lg:px-10">
      <Link href={user ? '/dashboard' : '/'} className="flex min-h-11 min-w-0 items-center gap-2 rounded-lg font-semibold focus-visible:outline-2
        focus-visible:outline-ring">
        <span aria-hidden="true" className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Dumbbell className="size-4" />
        </span>
        <span className="truncate font-heading text-lg tracking-tight">{APP_NAME}</span>
      </Link>
      <div className="flex shrink-0 items-center gap-2">
        {status === 'loading' ? (
          <span className="h-11 w-28" aria-hidden="true" />
        ) : user ? (
          <AccountMenu name={user.name ?? ''} avatar={user.avatar} membership={user.membership} />
        ) : (
          <>
            {pathname !== '/sign-in' && (
              <Button variant="ghost" asChild className="px-3">
                <Link href="/sign-in">{COMMON_COPY.signIn}</Link>
              </Button>
            )}
            {pathname !== '/sign-up' && (
              <Button asChild variant={pathname === '/sign-in' ? 'ghost' : 'default'} className={pathname === '/sign-in' ? 'px-3' : 'hidden sm:inline-flex'}>
                <Link href="/sign-up">{COMMON_COPY.createAccount}</Link>
              </Button>
            )}
          </>
        )}
      </div>
    </header>
  );
};
