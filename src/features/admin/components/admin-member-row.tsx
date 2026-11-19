'use client';

import { AdminMemberActions } from '@/features/admin/components/admin-member-actions';
import type { AdminAction } from '@/features/admin/hooks/use-admin-users';
import type { AdminUserRow } from '@/features/admin/types/admin.types';
import type { AdminMembershipType } from '@/features/admin/validations/admin.validation';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { ADMIN_COPY } from '@/shared/const/copy-admin.const';
import { cn } from '@/shared/lib/utils';
import { formatDate } from '@/shared/utils/format';

const copy = ADMIN_COPY.people;

const PLAN_CLASS = {
  paid: 'bg-pool text-pool-foreground',
  gift: 'bg-primary text-primary-foreground',
  free: 'bg-muted text-muted-foreground',
} as const;

type AdminMemberRowProps = {
  user: AdminUserRow;
  self: boolean;
  busy: boolean;
  onAction: (userId: string, action: AdminAction, body?: AdminMembershipType) => void;
};

const planLine = (user: AdminUserRow) => {
  if (!user.premiumUntil) return copy.joined(formatDate(user.joinedAt));
  return user.cancelling ? copy.cancelling(formatDate(user.premiumUntil)) : copy.until(formatDate(user.premiumUntil));
};

export const AdminMemberRow = ({ user, self, busy, onAction }: AdminMemberRowProps) => (
  <li className="flex flex-col gap-3 p-4">
    <div className="flex items-start gap-3">
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-base font-semibold">{user.name}</span>
          {self && <span className="text-sm font-bold text-primary-ink">{copy.you}</span>}
          {user.isAdmin && !self && <span className="text-sm font-bold text-muted-foreground">{copy.admin}</span>}
        </span>
        <span className="truncate text-base text-muted-foreground">{user.email}</span>
        <span className="text-sm tabular-nums text-muted-foreground">{planLine(user)}</span>
      </span>
      <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-sm font-bold', PLAN_CLASS[user.plan])}>{copy.plan[user.plan]}</span>
    </div>
    <Disclosure summary={<span aria-label={copy.manageLabel(user.name)}>{copy.manage}</span>} className="bg-background">
      <AdminMemberActions user={user} self={self} busy={busy} onAction={(action, body) => onAction(user.id, action, body)} />
    </Disclosure>
  </li>
);
