import { describe, expect, it } from 'vitest';

import type { Membership } from '@/features/membership/types/membership.types';
import { isMembershipEntitled } from '@/shared/utils/membership';

const membership: Membership = {
  tier: 'premium', status: 'active', subscriptionId: 'sub_1', cancelAtPeriodEnd: false,
  lastEventAt: new Date(), nextBillingDate: new Date(Date.now() + 86400000),
};

describe('isMembershipEntitled', () => {
  it('preserves paid-through access and hides expired, unpaid, and refunded badges', () => {
    expect(isMembershipEntitled(membership)).toBe(true);
    expect(isMembershipEntitled({ ...membership, status: 'cancelled' })).toBe(true);
    expect(isMembershipEntitled({ ...membership, status: 'past_due' })).toBe(false);
    expect(isMembershipEntitled({ ...membership, nextBillingDate: new Date(0) })).toBe(false);
    expect(isMembershipEntitled({ ...membership, refundedPeriodEnd: membership.nextBillingDate })).toBe(false);
    expect(isMembershipEntitled(null)).toBe(false);
    expect(isMembershipEntitled({ ...membership, environment: 'test_mode' }, 'live')).toBe(false);
  });
});
