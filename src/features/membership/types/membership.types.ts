import type { MembershipTier } from '@/shared/const/membership.const';

export type { MembershipTier };

export type MembershipStatus =
  | 'pending'
  | 'active'
  | 'on_hold'
  | 'paused'
  | 'cancelled'
  | 'failed'
  | 'expired'
  | 'past_due';

export type Membership = {
  tier: MembershipTier;
  status: MembershipStatus;
  subscriptionId: string;
  customerId?: string;
  nextBillingDate?: Date;
  cancelAtPeriodEnd: boolean;
  environment?: 'test_mode' | 'live_mode';
  refundedPeriodEnd?: Date;
  lastEventAt: Date;
};

export type MembershipSummary = {
  entitled?: boolean;
  tier: MembershipTier;
  status: MembershipStatus;
  subscriptionId: string;
  nextBillingDate?: string;
  refundedPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
};
