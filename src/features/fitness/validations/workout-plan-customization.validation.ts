import { z } from 'zod';

export const WorkoutPlanCustomizationSchema = z.strictObject({
  overrides: z
    .array(
      z.strictObject({
        sessionIndex: z.number().int().min(0).max(2),
        exerciseIds: z
          .array(z.string().min(1).max(80))
          .min(1)
          .max(5)
          .refine((ids) => new Set(ids).size === ids.length, {
            message: 'Exercises must be unique within a session',
          }),
      })
    )
    .max(3)
    .refine(
      (overrides) =>
        new Set(overrides.map(({ sessionIndex }) => sessionIndex)).size ===
        overrides.length,
      { message: 'Each session can only have one customization' }
    ),
});

export type WorkoutPlanCustomizationInput = z.infer<
  typeof WorkoutPlanCustomizationSchema
>;
