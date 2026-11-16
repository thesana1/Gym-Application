import { z } from 'zod';

import { FITNESS_GOALS } from '@/shared/const/fitness.const';
import { FOCUS_AREAS, TRAINING_LIMITS } from '@/shared/const/training.const';
import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';

const L = TRAINING_LIMITS;
const GoalSchema = z.enum(FITNESS_GOALS.map(({ value }) => value));
const FocusSchema = z.enum(FOCUS_AREAS.map(({ value }) => value));
const Weekday = z.number().int().min(0).max(6);

export const PlanExerciseSchema = z.strictObject({
  exerciseId: z.string().refine((id) => WORKOUT_EXERCISE_LIBRARY.some((exercise) => exercise.id === id), 'Choose an exercise from the list'),
  sets: z.number().int().min(L.minSets).max(L.maxSets),
  repMin: z.number().int().min(L.minReps).max(L.maxReps),
  repMax: z.number().int().min(L.minReps).max(L.maxReps),
  restSeconds: z.number().int().min(L.minRest).max(L.maxRest),
}).refine((exercise) => exercise.repMax >= exercise.repMin, { message: 'The top of the rep range must not be below the bottom', path: ['repMax'] });

export const PlanWorkoutSchema = z.strictObject({
  id: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1, 'Give this workout a name').max(L.maxNameLength),
  weekday: Weekday.nullable(),
  exercises: z.array(PlanExerciseSchema).min(L.minExercises, 'Add at least one exercise').max(L.maxExercises),
});

export const TrainingPlanSchema = z.strictObject({
  goal: GoalSchema,
  focusAreas: z.array(FocusSchema).max(FOCUS_AREAS.length),
  source: z.enum(['ai', 'library', 'manual']),
  workouts: z.array(PlanWorkoutSchema).min(1).max(L.maxWorkouts),
}).refine((plan) => {
  const days = plan.workouts.flatMap(({ weekday }) => (weekday === null ? [] : [weekday]));
  return new Set(days).size === days.length;
}, { message: 'Only one workout can be on each day', path: ['workouts'] })
  .refine((plan) => new Set(plan.workouts.map(({ id }) => id)).size === plan.workouts.length, { message: 'Workout ids must be unique', path: ['workouts'] });

export const PlanPrioritiesSchema = z.strictObject({
  goal: GoalSchema,
  focusAreas: z.array(FocusSchema).max(FOCUS_AREAS.length),
  weekdays: z.array(Weekday).min(L.minDays).max(L.maxDays).refine((days) => new Set(days).size === days.length, 'Pick each day once'),
});

export type PlanExerciseType = z.infer<typeof PlanExerciseSchema>;
export type PlanWorkoutType = z.infer<typeof PlanWorkoutSchema>;
export type TrainingPlanType = z.infer<typeof TrainingPlanSchema>;
export type PlanPrioritiesType = z.infer<typeof PlanPrioritiesSchema>;
