import { z } from 'zod';

import { ADMIN_GIFT_MONTHS } from '@/shared/const/admin.const';

export const AdminUserIdSchema = z.string().min(24).max(24);

export const AdminSearchSchema = z.object({ query: z.string().trim().max(100) });
export type AdminSearchType = z.infer<typeof AdminSearchSchema>;

export const AdminMembershipSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('gift'), months: z.number().int().refine((months) => ADMIN_GIFT_MONTHS.some((option) => option === months)) }),
  z.object({ action: z.literal('remove-gift') }),
  z.object({ action: z.literal('cancel-subscription') }),
]);
export type AdminMembershipType = z.infer<typeof AdminMembershipSchema>;

// The gift form posts the select's value as a string.
export const AdminGiftFormSchema = z.object({ months: z.enum(ADMIN_GIFT_MONTHS.map(String) as [string, ...string[]]) });
export type AdminGiftFormType = z.infer<typeof AdminGiftFormSchema>;
