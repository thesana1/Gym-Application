'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import type { MembershipSummary } from '@/features/membership/types/membership.types';
import { AccountMenu } from '@/shared/components/layout/account-menu';
import { BurgerMenu } from '@/shared/components/layout/burger-menu';
import { ThemeToggle } from '@/shared/components/layout/theme-toggle';
import { Button } from '@/shared/components/ui/button';
import { APP_NAME } from '@/shared/const/app.const';
import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { ONBOARDING_ROUTES } from '@/shared/const/routes.const';

type SessionUser = {
  name?: string | null;
  avatar?: string | null;
  membership?: MembershipSummary | null;
};

// menu: shows the burger menu for signed-in members who finished onboarding. It stays hidden on the Premium offer page.
type HeaderProps = { menu?: boolean };

export const Header = ({ menu = false }: HeaderProps) => {
  const { data: session, status } = useSession();
  const user = session?.user as SessionUser | undefined;
  const pathname = usePathname();
  const showMenu = menu && Boolean(user) && pathname !== ONBOARDING_ROUTES.welcome;
  return (
    <header className="sticky top-0 z-30 flex min-w-0 items-center justify-between gap-2 border-b border-border bg-background px-4 py-2
      sm:px-6 lg:px-10">
      <div className="flex min-w-0 items-center gap-1">
        {showMenu && <BurgerMenu />}
        <Link href={user ? '/dashboard' : '/'} className="flex min-h-11 min-w-0 items-center gap-2 rounded-lg font-semibold focus-visible:outline-2
          focus-visible:outline-ring">
          {/* Two floats from the lane rope stand in for a logo. */}
          <span aria-hidden="true" className="flex shrink-0 gap-0.5">
            <span className="size-3 rounded-full bg-primary" />
            <span className="size-3 rounded-full bg-pool" />
          </span>
          <span className="truncate font-heading text-lg font-extrabold tracking-display">{APP_NAME}</span>
        </Link>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
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
