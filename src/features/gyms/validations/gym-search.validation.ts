import { z } from 'zod';

export const GymSearchSchema = z.strictObject({
  location: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .refine((value) => !value.includes('@'), 'Do not enter personal contact details'),
});

export type GymSearchType = z.infer<typeof GymSearchSchema>;
