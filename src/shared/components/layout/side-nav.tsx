'use client';

import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useLogout } from '@/features/auth/hooks/use-logout';
import { NavIcon } from '@/shared/components/layout/nav-icon';
import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { MAIN_NAV_ITEMS, NAV_COPY, type NavItem } from '@/shared/const/navigation.const';
import { ONBOARDING_ROUTES } from '@/shared/const/routes.const';
import { useMoreNavItems } from '@/shared/hooks/use-more-nav-items';
import { cn } from '@/shared/lib/utils';

// Home only matches itself; other sections also stay highlighted on their sub-pages (for example a single workout).
const isActive = (item: NavItem, pathname: string) =>
  pathname === item.href || Boolean(item.matches?.includes(pathname)) || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));

// Icon only on phones and tablets; the label shows next to it from the lg breakpoint.
const rowClassName = `flex min-h-11 items-center justify-center gap-3 rounded-xl px-3 text-base font-medium transition-colors
  hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring lg:justify-start`;

const NavLink = ({ item, active }: { item: NavItem; active: boolean }) => (
  <li>
    <Link href={item.href} aria-current={active ? 'page' : undefined} title={item.label}
      className={cn(rowClassName, active ? 'bg-primary text-primary-foreground hover:bg-primary' : 'text-foreground')}>
      <NavIcon name={item.icon} className={active ? undefined : 'text-muted-foreground'} />
      <span className="sr-only lg:not-sr-only lg:truncate">{item.label}</span>
    </Link>
  </li>
);

// Left-side navigation for signed-in members: the four main sections, then the smaller links, then sign out.
// It stays hidden on the Premium offer page shown right after onboarding.
export const SideNav = () => {
  const pathname = usePathname();
  const moreItems = useMoreNavItems();
  const { logout } = useLogout();
  if (pathname === ONBOARDING_ROUTES.welcome) return null;

  return (
    <aside className="w-16 shrink-0 border-r border-border bg-background lg:w-64">
      <nav aria-label={NAV_COPY.mainLabel} className="sticky top-15 flex flex-col gap-4 px-2 py-4 lg:px-4">
        <ul className="flex flex-col gap-1">
          {MAIN_NAV_ITEMS.map((item) => <NavLink key={item.href} item={item} active={isActive(item, pathname)} />)}
        </ul>
        <ul className="flex flex-col gap-1 border-t border-border pt-4">
          {moreItems.map((item) => <NavLink key={item.href} item={item} active={isActive(item, pathname)} />)}
        </ul>
        <div className="border-t border-border pt-4">
          <button type="button" onClick={() => void logout()} title={COMMON_COPY.signOut}
            className={cn(rowClassName, 'w-full text-left text-muted-foreground')}>
            <LogOut className="size-5 shrink-0" aria-hidden="true" />
            <span className="sr-only lg:not-sr-only">{COMMON_COPY.signOut}</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};
