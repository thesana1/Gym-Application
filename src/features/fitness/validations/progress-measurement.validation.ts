import { z } from 'zod';

const measurementNumber = (min: number, max: number, label: string) =>
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

const measurementDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a calendar date')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Enter a valid calendar date');

export const ProgressMeasurementSchema = z
  .strictObject({
    date: measurementDate,
    weightKg: measurementNumber(30, 350, 'weight'),
    waistCm: measurementNumber(20, 300, 'waist measurement'),
    hipsCm: measurementNumber(20, 300, 'hip measurement'),
    chestCm: measurementNumber(20, 300, 'chest measurement'),
    armCm: measurementNumber(10, 150, 'arm measurement'),
    thighCm: measurementNumber(20, 200, 'thigh measurement'),
    notes: z.string().trim().max(500).optional(),
  })
  .refine(
    (value) =>
      value.weightKg !== undefined ||
      value.waistCm !== undefined ||
      value.hipsCm !== undefined ||
      value.chestCm !== undefined ||
      value.armCm !== undefined ||
      value.thighCm !== undefined,
    { message: 'Enter at least one measurement', path: ['weightKg'] }
  );

export type ProgressMeasurementInput = z.input<typeof ProgressMeasurementSchema>;
export type ProgressMeasurementType = z.infer<typeof ProgressMeasurementSchema>;

export const ProgressMeasurementIdSchema = z.string().min(24).max(24).regex(/^[\da-f]{24}$/i);
