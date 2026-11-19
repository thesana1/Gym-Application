'use client';

import { ChevronRight, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dialog } from 'radix-ui';
import { useRef, useState } from 'react';

import { useLogout } from '@/features/auth/hooks/use-logout';
import { NavIcon } from '@/shared/components/layout/nav-icon';
import { ThemeToggle } from '@/shared/components/layout/theme-toggle';
import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { MAIN_NAV_ITEMS, NAV_COPY, type NavItem } from '@/shared/const/navigation.const';
import { useMoreNavItems } from '@/shared/hooks/use-more-nav-items';
import { cn } from '@/shared/lib/utils';

const isActive = (item: NavItem, pathname: string) => pathname === item.href || Boolean(item.matches?.includes(pathname));

const tabClassName = (active: boolean) => cn(
  'group flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-sm font-bold transition-colors',
  'focus-visible:outline-2 focus-visible:outline-ring',
  active ? 'text-foreground' : 'text-muted-foreground'
);

export const MobileNavigation = () => {
  const pathname = usePathname();
  const moreItems = useMoreNavItems();
  const { logout } = useLogout();
  const moreRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const moreActive = moreItems.some((item) => isActive(item, pathname));

  return (
    <>
      <nav aria-label={NAV_COPY.mainLabel}
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card px-1 pb-5 pt-1.5 lg:hidden">
        {MAIN_NAV_ITEMS.map((item) => {
          const active = isActive(item, pathname);
          return (
            <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={tabClassName(active)}>
              <span className={cn('flex h-8 w-14 items-center justify-center rounded-full transition-[background-color,transform] duration-150',
                'group-active:scale-90', active && 'bg-primary text-primary-foreground')}>
                <NavIcon name={item.icon} />
              </span>
              {item.label}
            </Link>
          );
        })}
        <button ref={moreRef} type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-haspopup="dialog"
          className={tabClassName(moreActive)}>
          <span className={cn('flex h-8 w-14 items-center justify-center rounded-full transition-[background-color,transform] duration-150',
            'group-active:scale-90', moreActive && 'bg-primary text-primary-foreground')}>
            <Menu className="size-5" aria-hidden="true" />
          </span>
          {NAV_COPY.more}
        </button>
      </nav>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/40 animate-in fade-in-0" />
          <Dialog.Content
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              moreRef.current?.focus();
            }}
            className={cn('fixed inset-x-0 bottom-0 z-50 flex max-h-dvh flex-col rounded-t-3xl bg-card pb-8 shadow-xl',
              'animate-in slide-in-from-bottom duration-200')}>
            <div className="flex items-center justify-between px-5 pb-1 pt-4">
              <Dialog.Title className="font-heading text-2xl font-extrabold tracking-display">{NAV_COPY.moreTitle}</Dialog.Title>
              <Dialog.Close className="flex min-h-11 items-center gap-1 rounded-lg px-3 text-base font-medium text-muted-foreground
                hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring">
                <X className="size-5" aria-hidden="true" />{NAV_COPY.close}
              </Dialog.Close>
            </div>
            <Dialog.Description className="px-5 text-base text-muted-foreground">{NAV_COPY.moreDescription}</Dialog.Description>
            <ul className="mt-3 flex flex-col overflow-y-auto px-2">
              {moreItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={() => setOpen(false)} aria-current={isActive(item, pathname) ? 'page' : undefined}
                    className={cn('flex min-h-16 items-center gap-4 rounded-lg px-3 py-2 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring',
                      isActive(item, pathname) && 'bg-accent')}>
                    <NavIcon name={item.icon} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-base font-semibold">{item.label}</span>
                      <span className="text-base text-muted-foreground">{item.description}</span>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mx-5 my-2 border-t border-border" />
            <div className="flex flex-col px-2">
              <ThemeToggle />
              <button type="button" onClick={() => void logout()}
                className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-left text-base font-medium hover:bg-accent
                  focus-visible:outline-2 focus-visible:outline-ring">
                <LogOut className="size-5" aria-hidden="true" />{COMMON_COPY.signOut}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
