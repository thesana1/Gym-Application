import { BadgeCheck } from 'lucide-react';

import type { MembershipSummary } from '@/features/membership/types/membership.types';
import { MEMBERSHIP_PLANS } from '@/shared/const/membership.const';

type MembershipBadgeProps = {
  membership?: MembershipSummary | null;
};

export const MembershipBadge = ({ membership }: MembershipBadgeProps) => {
  if (!membership || !['active', 'past_due'].includes(membership.status)) {
    return null;
  }

  const plan = MEMBERSHIP_PLANS.find(({ tier }) => tier === membership.tier);
  if (!plan) return null;

  return (
    <span
      aria-label={`${plan.name} member`}
      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary"
    >
      <BadgeCheck aria-hidden="true" className="size-3.5" />
      {plan.name}
    </span>
  );
};
