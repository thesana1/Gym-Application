'use client';

import { ChevronRight, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dialog } from 'radix-ui';
import { useRef, useState } from 'react';

import { useLogout } from '@/features/auth/hooks/use-logout';
import { NavIcon } from '@/shared/components/layout/nav-icon';
import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { MAIN_NAV_ITEMS, NAV_COPY, type NavItem } from '@/shared/const/navigation.const';
import { useMoreNavItems } from '@/shared/hooks/use-more-nav-items';
import { cn } from '@/shared/lib/utils';

// Home only matches itself; other sections also stay highlighted on their sub-pages (for example a single workout).
const isActive = (item: NavItem, pathname: string) =>
  pathname === item.href || Boolean(item.matches?.includes(pathname)) || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));

const rowClassName = 'flex items-center rounded-xl px-3 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring';

export const BurgerMenu = () => {
  const pathname = usePathname();
  const moreItems = useMoreNavItems();
  const { logout } = useLogout();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger ref={triggerRef} aria-label={NAV_COPY.openMenu}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring">
        <Menu className="size-6" aria-hidden="true" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm animate-in fade-in-0" />
        <Dialog.Content
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
          className="fixed inset-y-0 left-0 z-50 flex w-full max-w-sm flex-col border-r border-border bg-card shadow-xl
            animate-in slide-in-from-left duration-300">
          <div className="flex items-center justify-between px-5 pb-1 pt-4">
            <Dialog.Title className="font-heading text-2xl font-semibold">{NAV_COPY.menuTitle}</Dialog.Title>
            <Dialog.Close aria-label={NAV_COPY.close}
              className="inline-flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-accent
                focus-visible:outline-2 focus-visible:outline-ring">
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="px-5 text-base text-muted-foreground">{NAV_COPY.menuDescription}</Dialog.Description>

          <nav aria-label={NAV_COPY.mainLabel} className="mt-4 flex flex-1 flex-col overflow-y-auto px-3">
            <ul className="flex flex-col gap-1">
              {MAIN_NAV_ITEMS.map((item, index) => {
                const active = isActive(item, pathname);
                return (
                  <li key={item.href}>
                    <Link href={item.href} onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined}
                      className={cn(rowClassName, 'group min-h-16 gap-4 py-2', active && 'bg-primary/10')}>
                      <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors',
                        active ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary group-hover:bg-primary/15')}>
                        <NavIcon name={item.icon} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="flex items-baseline gap-2 text-lg font-semibold">
                          <span className="font-mono text-sm text-muted-foreground">{index + 1}</span>{item.label}
                        </span>
                        <span className="text-sm text-muted-foreground">{item.description}</span>
                      </span>
                      <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <h2 className="mt-6 px-3 pb-1 text-sm font-semibold text-muted-foreground">{NAV_COPY.moreHeading}</h2>
            <ul className="flex flex-col">
              {moreItems.map((item) => {
                const active = isActive(item, pathname);
                return (
                  <li key={item.href}>
                    <Link href={item.href} onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined}
                      className={cn(rowClassName, 'min-h-12 gap-3 text-base font-medium', active ? 'text-primary' : 'text-foreground')}>
                      <NavIcon name={item.icon} className="text-muted-foreground" />{item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-border px-3 py-3">
            <button type="button" onClick={() => void logout()}
              className={cn(rowClassName, 'min-h-12 w-full gap-3 text-left text-base font-medium')}>
              <LogOut className="size-5" aria-hidden="true" />{COMMON_COPY.signOut}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
