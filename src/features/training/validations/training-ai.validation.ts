import { z } from 'zod';

import { TRAINING_LIMITS } from '@/shared/const/training.const';

export const AiTrainingPlanSchema = z.strictObject({
  summary: z.string().max(400),
  workouts: z.array(z.strictObject({
    name: z.string().min(1).max(60),
    exerciseIds: z.array(z.string().min(1).max(80)).min(1).max(TRAINING_LIMITS.maxExercises),
  })).min(1).max(TRAINING_LIMITS.maxDays),
});

export const AiWorkoutTipSchema = z.strictObject({ tip: z.string().min(1).max(300) });

export const WorkoutTipRequestSchema = z.strictObject({
  workoutName: z.string().trim().min(1).max(TRAINING_LIMITS.maxNameLength),
  exercises: z.array(z.strictObject({
    name: z.string().min(1).max(100),
    sets: z.array(z.strictObject({ repetitions: z.number().int().min(1).max(100), weightKg: z.number().min(0).max(500).optional() })).max(10),
    nextChange: z.enum(['start', 'up', 'same', 'down', 'harder']),
  })).min(1).max(TRAINING_LIMITS.maxExercises),
});

export type AiTrainingPlan = z.infer<typeof AiTrainingPlanSchema>;
export type WorkoutTipRequest = z.infer<typeof WorkoutTipRequestSchema>;
