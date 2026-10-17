import { z } from 'zod';

import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';

const optionalWeight = z
  .union([
    z.literal(''),
    z.undefined(),
    z.string().regex(/^\d+(\.\d+)?$/, 'Enter a valid weight').transform(Number),
    z.number(),
  ])
  .transform((value) => (value === '' || value === undefined ? undefined : value))
  .pipe(z.number().min(0).max(500).optional())
  .optional();

const optionalDate = z
  .union([z.literal(''), z.undefined(), z.string().datetime({ offset: true }), z.date()])
  .transform((value) => (value === '' ? undefined : value))
  .pipe(z.union([z.string().datetime({ offset: true }), z.date()]).optional())
  .optional();

export const WorkoutLogSchema = z.strictObject({
  title: z.string().trim().min(1).max(80),
  completedAt: optionalDate,
  notes: z.string().trim().max(1000).optional(),
  exercises: z
    .array(
      z.strictObject({
        exerciseId: z
          .string()
          .refine(
            (id) => WORKOUT_EXERCISE_LIBRARY.some((exercise) => exercise.id === id),
            'Choose an exercise from the library'
          ),
        sets: z
          .array(
            z.strictObject({
              repetitions: z
                .union([
                  z.string().regex(/^\d+$/, 'Enter a whole number').transform(Number),
                  z.number().int(),
                ])
                .pipe(z.number().int().min(1).max(100)),
              weightKg: optionalWeight,
            })
          )
          .min(1)
          .max(10),
      })
    )
    .min(1)
    .max(20),
});

export type WorkoutLogInput = z.input<typeof WorkoutLogSchema>;
export type WorkoutLogType = z.infer<typeof WorkoutLogSchema>;

export const WorkoutLogQuerySchema = z.strictObject({
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  exerciseId: z
    .string()
    .refine(
      (id) => WORKOUT_EXERCISE_LIBRARY.some((exercise) => exercise.id === id),
      'Choose an exercise from the library'
    )
    .optional(),
});

export type WorkoutLogQuery = z.infer<typeof WorkoutLogQuerySchema>;

export const WorkoutLogIdSchema = z.string().min(24).max(24).regex(/^[\da-f]{24}$/i);
