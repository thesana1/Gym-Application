import { z } from 'zod';

import {
  AVAILABLE_EQUIPMENT,
  FitnessGoal,
  FITNESS_GOALS,
  TrainingExperience,
  TRAINING_EXPERIENCE_LEVELS,
} from '@/shared/const/fitness.const';

// Required during sign-up: an empty answer gets a friendly message instead of a number error.
const requiredNumber = (min: number, max: number, wholeOnly: boolean, emptyMessage = 'Please fill this in.') =>
  z
    .union([z.string(), z.number()])
    .transform(String)
    .pipe(
      z
        .string()
        .trim()
        .min(1, { error: emptyMessage, abort: true })
        .regex(wholeOnly ? /^\d+$/ : /^\d+(\.\d+)?$/, wholeOnly ? 'Enter a whole number' : 'Enter a valid number')
    )
    .transform(Number)
    .pipe(z.number().min(min, `Enter at least ${min}`).max(max, `Enter at most ${max}`));

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
  age: requiredNumber(13, 100, true),
  heightCm: requiredNumber(100, 250, false),
  weightKg: requiredNumber(30, 350, false),
  trainingDaysPerWeek: requiredNumber(1, 7, true, 'Please pick a number.'),
  availableEquipment: z.array(availableEquipment).max(AVAILABLE_EQUIPMENT.length),
});

export type FitnessProfileInput = z.input<typeof FitnessProfileSchema>;
export type FitnessProfileType = z.infer<typeof FitnessProfileSchema>;
