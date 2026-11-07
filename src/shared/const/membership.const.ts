export const MEMBERSHIP_PLANS = [{ tier: 'premium', name: 'Premium', price: 20 }] as const;

// Existing subscriptions keep their historical tier until their billing agreement ends.
export type MembershipTier = 'premium' | 'vip' | 'vipplus' | 'supervip';
