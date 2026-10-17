import { workoutLogRepository } from '@/features/fitness/repository/workout-log.repository';
import type { WorkoutLogDocument } from '@/features/fitness/schema/workout-log.schema';
import {
  WorkoutLogQuery,
  WorkoutLogType,
} from '@/features/fitness/validations/workout-log.validation';
import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';
import { ServiceResult } from '@/shared/types/common';

export type WorkoutLog = {
  id: string;
  title: string;
  completedAt: string;
  notes?: string;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: { repetitions: number; weightKg?: number }[];
  }[];
};

const toWorkoutLog = (document: WorkoutLogDocument): WorkoutLog => ({
  id: document._id.toString(),
  title: document.title,
  completedAt: document.completedAt.toISOString(),
  notes: document.notes ?? undefined,
  exercises: document.exercises.map((exercise) => ({
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.exerciseName,
    sets: exercise.sets.map((set) => ({
      repetitions: set.repetitions,
      ...(set.weightKg == null ? {} : { weightKg: set.weightKg }),
    })),
  })),
});

const prepareWorkout = (input: WorkoutLogType) => ({
  ...input,
  completedAt: input.completedAt ? new Date(input.completedAt) : new Date(),
  exercises: input.exercises.map((exercise) => {
    const definition = WORKOUT_EXERCISE_LIBRARY.find(
      (candidate) => candidate.id === exercise.exerciseId
    );
    if (!definition) throw new Error('Validated exercise is missing from the library');
    return { ...exercise, exerciseName: definition.name };
  }),
});

export async function listWorkoutLogsService(
  userId: string,
  query: WorkoutLogQuery
): Promise<ServiceResult<WorkoutLog[]>> {
  const workouts = await workoutLogRepository.findByUserId(userId, query);
  return { data: workouts.map(toWorkoutLog), status: 200 };
}

export async function createWorkoutLogService(
  userId: string,
  input: WorkoutLogType
): Promise<ServiceResult<WorkoutLog>> {
  const workout = await workoutLogRepository.create(userId, prepareWorkout(input));
  if (!workout) return { data: { error: 'INTERNAL_ERROR' }, status: 500 };
  return { data: toWorkoutLog(workout), status: 201 };
}

export async function updateWorkoutLogService(
  userId: string,
  workoutId: string,
  input: WorkoutLogType
): Promise<ServiceResult<WorkoutLog>> {
  const workout = await workoutLogRepository.updateById(
    userId,
    workoutId,
    prepareWorkout(input)
  );
  if (!workout) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: toWorkoutLog(workout), status: 200 };
}

export async function deleteWorkoutLogService(
  userId: string,
  workoutId: string
): Promise<ServiceResult<{ deleted: true }>> {
  const deleted = await workoutLogRepository.deleteById(userId, workoutId);
  if (!deleted) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: { deleted: true }, status: 200 };
}
