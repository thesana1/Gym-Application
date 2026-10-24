import { z } from 'zod';

export const MembershipCheckoutSchema = z.object({
  tier: z.enum(['vip', 'vipplus', 'supervip']),
});

export type MembershipCheckoutType = z.infer<typeof MembershipCheckoutSchema>;
