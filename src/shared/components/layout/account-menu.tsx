'use client';

import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { DropdownMenu } from 'radix-ui';

import { useLogout } from '@/features/auth/hooks/use-logout';
import { MembershipBadge } from '@/features/membership/components/membership-badge';
import type { MembershipSummary } from '@/features/membership/types/membership.types';
import { ThemeToggle } from '@/shared/components/layout/theme-toggle';
import { Button } from '@/shared/components/ui/button';
import { ACCOUNT_MENU_COPY, COMMON_COPY } from '@/shared/const/copy-common.const';

type AccountMenuProps = {
  name: string;
  avatar?: string | null;
  membership?: MembershipSummary | null;
};

const itemClassName = 'flex min-h-12 items-center rounded-lg px-3 text-base outline-none focus:bg-accent';

export const AccountMenu = ({ name, avatar, membership }: AccountMenuProps) => {
  const { logout } = useLogout();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" className="gap-2 px-3">
          {avatar ? (
            <Image src={avatar} alt="" width={28} height={28} className="size-7 rounded-full object-cover" />
          ) : (
            <UserRound className="size-5" aria-hidden="true" />
          )}
          <span>{COMMON_COPY.account}</span>
          <ChevronDown className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} className="z-50 w-72 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg">
          <DropdownMenu.Label className="break-words px-3 py-2 text-base font-semibold">{name || COMMON_COPY.accountFallbackName}</DropdownMenu.Label>
          <DropdownMenu.Item asChild>
            <Link href="/dashboard" className={itemClassName}>{ACCOUNT_MENU_COPY.home}</Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link href="/dashboard/profile" className={itemClassName}>{ACCOUNT_MENU_COPY.profile}</Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link href="/dashboard/membership" className={`${itemClassName} justify-between`}>
              {ACCOUNT_MENU_COPY.plan} <MembershipBadge membership={membership} />
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-2 border-t border-border" />
          <DropdownMenu.Item asChild onSelect={(event) => event.preventDefault()}>
            <ThemeToggle className="focus:bg-accent" />
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => void logout()} className={`${itemClassName} cursor-pointer gap-3 font-medium`}>
            <LogOut className="size-5" aria-hidden="true" /> {COMMON_COPY.signOut}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
