import { z } from 'zod';

import {
  AVAILABLE_EQUIPMENT,
  FitnessGoal,
  FITNESS_GOALS,
  TrainingExperience,
  TRAINING_EXPERIENCE_LEVELS,
} from '@/shared/const/fitness.const';

const optionalWholeNumber = (min: number, max: number) =>
  z
    .union([
      z.literal(''),
      z.undefined(),
      z.string().regex(/^\d+$/, 'Enter a whole number').transform(Number),
      z.number().int(),
    ])
    .transform((value) => (value === '' || value === undefined ? undefined : value))
    .pipe(z.number().int().min(min).max(max).optional());

const optionalDecimal = (min: number, max: number) =>
  z
    .union([
      z.literal(''),
      z.undefined(),
      z.string().regex(/^\d+(\.\d+)?$/, 'Enter a valid number').transform(Number),
      z.number(),
    ])
    .transform((value) => (value === '' || value === undefined ? undefined : value))
    .pipe(z.number().min(min).max(max).optional());

const fitnessGoal = z
  .string()
  .refine(
    (value): value is FitnessGoal =>
      FITNESS_GOALS.some((option) => option.value === value),
    'Choose a valid fitness goal'
  );

const trainingExperience = z
  .string()
  .refine(
    (value): value is TrainingExperience =>
      TRAINING_EXPERIENCE_LEVELS.some((option) => option.value === value),
    'Choose a valid training experience'
  );

const availableEquipment = z
  .string()
  .refine(
    (value): value is (typeof AVAILABLE_EQUIPMENT)[number]['value'] =>
      AVAILABLE_EQUIPMENT.some((option) => option.value === value),
    'Choose equipment from the list'
  );

export const FitnessProfileSchema = z.strictObject({
  goal: z
    .union([z.literal(''), fitnessGoal])
    .refine((value): value is FitnessGoal => value !== '', 'Choose a fitness goal'),
  experience: z
    .union([z.literal(''), trainingExperience])
    .refine(
      (value): value is TrainingExperience => value !== '',
      'Choose your training experience'
    ),
  age: optionalWholeNumber(13, 100).optional(),
  heightCm: optionalDecimal(100, 250).optional(),
  weightKg: optionalDecimal(30, 350).optional(),
  trainingDaysPerWeek: optionalWholeNumber(1, 7).optional(),
  availableEquipment: z.array(availableEquipment).max(AVAILABLE_EQUIPMENT.length),
});

export type FitnessProfileInput = z.input<typeof FitnessProfileSchema>;
export type FitnessProfileType = z.infer<typeof FitnessProfileSchema>;
