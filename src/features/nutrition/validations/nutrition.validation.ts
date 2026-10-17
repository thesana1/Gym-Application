import { z } from 'zod';

const numericValue = (min: number, max: number, label: string) =>
  z
    .union([
      z.string().regex(/^\d+(\.\d+)?$/, `Enter a valid ${label}`).transform(Number),
      z.number(),
    ])
    .pipe(z.number().min(min).max(max));

const optionalNumericValue = (min: number, max: number, label: string) =>
  z
    .union([
      z.literal(''),
      z.undefined(),
      z.string().regex(/^\d+(\.\d+)?$/, `Enter a valid ${label}`).transform(Number),
      z.number(),
    ])
    .transform((value) => (value === '' || value === undefined ? undefined : value))
    .pipe(z.number().min(min).max(max).optional())
    .optional();

export const NutritionTargetsSchema = z.strictObject({
  calories: numericValue(500, 10000, 'calorie target'),
  proteinGrams: numericValue(0, 1000, 'protein target'),
  carbohydrateGrams: numericValue(0, 1500, 'carbohydrate target'),
  fatGrams: numericValue(0, 500, 'fat target'),
  fiberGrams: numericValue(0, 200, 'fiber target'),
  waterMl: numericValue(0, 10000, 'water target'),
});

export type NutritionTargetsInput = z.input<typeof NutritionTargetsSchema>;
export type NutritionTargetsType = z.infer<typeof NutritionTargetsSchema>;

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a calendar date')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Enter a valid calendar date');

export const NutritionEntrySchema = z.strictObject({
  date: dateString,
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  foodName: z.string().trim().min(1).max(120),
  calories: numericValue(0, 10000, 'calories'),
  proteinGrams: numericValue(0, 1000, 'protein'),
  carbohydrateGrams: numericValue(0, 1500, 'carbohydrates'),
  fatGrams: numericValue(0, 500, 'fat'),
  fiberGrams: numericValue(0, 200, 'fiber'),
  waterMl: optionalNumericValue(0, 10000, 'water'),
  notes: z.string().trim().max(500).optional(),
});

export type NutritionEntryInput = z.input<typeof NutritionEntrySchema>;
export type NutritionEntryType = z.infer<typeof NutritionEntrySchema>;

export const NutritionEntryQuerySchema = z.union([
  z.strictObject({ date: dateString }),
  z
    .strictObject({ from: dateString, to: dateString })
    .superRefine(({ from, to }, context) => {
      if (from > to) {
        context.addIssue({
          code: 'custom',
          message: 'The start date must be on or before the end date',
          path: ['from'],
        });
        return;
      }
      const dateDifference =
        (Date.parse(`${to}T00:00:00.000Z`) -
          Date.parse(`${from}T00:00:00.000Z`)) /
        (24 * 60 * 60 * 1000);
      if (dateDifference > 6) {
        context.addIssue({
          code: 'custom',
          message: 'Date ranges can include at most seven calendar days',
          path: ['to'],
        });
      }
    }),
]);

export const NutritionEntryIdSchema = z.string().min(24).max(24).regex(/^[\da-f]{24}$/i);
