'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NavIcon } from '@/shared/components/layout/nav-icon';
import { MAIN_NAV_ITEMS, NAV_COPY, type NavItem } from '@/shared/const/navigation.const';
import { useMoreNavItems } from '@/shared/hooks/use-more-nav-items';
import { cn } from '@/shared/lib/utils';

type SidebarProps = { className?: string };

const isActive = (item: NavItem, pathname: string) => pathname === item.href || Boolean(item.matches?.includes(pathname));

const SidebarLink = ({ item, pathname }: { item: NavItem; pathname: string }) => {
  const active = isActive(item, pathname);
  return (
    <Link href={item.href} aria-current={active ? 'page' : undefined}
      className={cn('flex min-h-12 items-center gap-3 rounded-full px-4 text-base font-bold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-ring',
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}>
      <NavIcon name={item.icon} />
      {item.label}
    </Link>
  );
};

export const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  const moreItems = useMoreNavItems();
  return (
    <aside className={cn('w-64 shrink-0 flex-col border-r border-border bg-sidebar p-3', className)}>
      <nav aria-label={NAV_COPY.mainLabel} className="sticky top-20 flex flex-col gap-1">
        <div className="flex flex-col gap-1">
          {MAIN_NAV_ITEMS.map((item) => <SidebarLink key={item.href} item={item} pathname={pathname} />)}
        </div>
        <section aria-labelledby="sidebar-more" className="flex flex-col gap-1">
          {/* Hidden on screen; screen readers still announce the group name. */}
          <h2 id="sidebar-more" className="sr-only">{NAV_COPY.sidebarMoreHeading}</h2>
          {moreItems.map((item) => <SidebarLink key={item.href} item={item} pathname={pathname} />)}
        </section>
      </nav>
    </aside>
  );
};
