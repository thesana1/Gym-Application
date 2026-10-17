import { workoutLogRepository } from '@/features/fitness/repository/workout-log.repository';
import type { WorkoutLogQuery } from '@/features/fitness/validations/workout-log.validation';
import type { ServiceResult } from '@/shared/types/common';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 7;
const WINDOW_MS = WINDOW_DAYS * DAY_IN_MS;
const ALLOWED_WINDOW_COUNTS = [4, 8] as const;

export type TrainingActivityPeriod = {
  start: string;
  end: string;
  workoutCount: number;
  setCount: number;
  distinctExerciseCount: number;
};

export type TrainingActivity = {
  weeks: 4 | 8;
  periods: TrainingActivityPeriod[];
};

export const isAllowedTrainingActivityWeeks = (
  value: number
): value is TrainingActivity['weeks'] =>
  ALLOWED_WINDOW_COUNTS.some((weeks) => weeks === value);

export async function getTrainingActivityService(
  userId: string,
  weeks: TrainingActivity['weeks'],
  now = new Date()
): Promise<ServiceResult<TrainingActivity>> {
  const rangeStart = new Date(now.getTime() - weeks * WINDOW_MS);
  const query: WorkoutLogQuery = {
    from: rangeStart.toISOString(),
    to: now.toISOString(),
  };
  const workouts = await workoutLogRepository.findByUserId(userId, query);

  const periods = Array.from({ length: weeks }, (_, index) => {
    const start = new Date(rangeStart.getTime() + index * WINDOW_MS);
    const end = new Date(start.getTime() + WINDOW_MS);
    const logsInPeriod = workouts.filter(
      (workout) =>
        workout.completedAt >= start && workout.completedAt < end
    );
    const exercises = logsInPeriod.flatMap((workout) => workout.exercises);

    return {
      start: start.toISOString(),
      end: end.toISOString(),
      workoutCount: logsInPeriod.length,
      setCount: exercises.reduce(
        (total, exercise) => total + exercise.sets.length,
        0
      ),
      distinctExerciseCount: new Set(
        exercises.map((exercise) => exercise.exerciseId)
      ).size,
    };
  });

  return { data: { weeks, periods }, status: 200 };
}
