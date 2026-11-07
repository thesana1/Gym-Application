import { z } from 'zod';

export const CheckoutSchema = z.object({ kind: z.enum(['premium', 'consultation']) }).strict();
export type CheckoutType = z.infer<typeof CheckoutSchema>;
export const BillingActionSchema = z.object({}).strict();
export const BillingUserIdSchema = z.string().min(24).max(24).regex(/^[a-f\d]+$/i);

export const DodoConfigSchema = z.object({
  apiKey: z.string().trim().min(1),
  webhookKey: z.string().trim().min(1),
  environment: z.enum(['test', 'test_mode', 'live', 'live_mode'])
    .transform((value) => value === 'test' || value === 'test_mode' ? 'test_mode' as const : 'live_mode' as const),
  appUrl: z.string().url(),
});
