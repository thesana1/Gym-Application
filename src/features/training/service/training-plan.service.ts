import { listWorkoutLogsService } from '@/features/fitness/service/workout-log.service';
import { trainingPlanRepository } from '@/features/training/repository/training-plan.repository';
import type { TrainingPlanDocument } from '@/features/training/schema/training-plan.schema';
import { suggestNextTarget, type ExerciseTarget, type SetResult } from '@/features/training/service/training-progression.service';
import type { PlanWorkoutType, TrainingPlanType } from '@/features/training/validations/training-plan.validation';
import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';
import type { ServiceResult } from '@/shared/types/common';
import type { WorkoutExerciseDefinition } from '@/shared/types/workout';

export type TrainingPlan = TrainingPlanType & { createdAt: string; updatedAt: string };

export type WorkoutSession = {
  workout: PlanWorkoutType;
  exercises: (PlanWorkoutType['exercises'][number] & { definition: WorkoutExerciseDefinition; target: ExerciseTarget })[];
};

const HISTORY_DAYS = 120;

const toPlan = (document: TrainingPlanDocument): TrainingPlan => ({
  goal: document.goal as TrainingPlanType['goal'],
  focusAreas: document.focusAreas as TrainingPlanType['focusAreas'],
  source: document.source as TrainingPlanType['source'],
  workouts: document.workouts.map((workout) => ({
    id: workout.id,
    name: workout.name,
    weekday: workout.weekday ?? null,
    exercises: workout.exercises.map(({ exerciseId, sets, repMin, repMax, restSeconds }) => ({ exerciseId, sets, repMin, repMax, restSeconds })),
  })),
  createdAt: new Date(document.createdAt).toISOString(),
  updatedAt: new Date(document.updatedAt).toISOString(),
});

export async function getTrainingPlanService(userId: string): Promise<ServiceResult<TrainingPlan | null>> {
  const plan = await trainingPlanRepository.findByUserId(userId);
  return { data: plan ? toPlan(plan) : null, status: 200 };
}

export async function saveTrainingPlanService(userId: string, plan: TrainingPlanType): Promise<ServiceResult<TrainingPlan>> {
  const saved = await trainingPlanRepository.upsertByUserId(userId, plan);
  if (!saved) return { data: { error: 'INTERNAL_ERROR' }, status: 500 };
  return { data: toPlan(saved), status: 200 };
}

export async function deleteTrainingPlanService(userId: string): Promise<ServiceResult<{ deleted: boolean }>> {
  return { data: { deleted: await trainingPlanRepository.deleteByUserId(userId) }, status: 200 };
}

// One plan workout with next-session targets worked out from the person's own recent logs.
export async function getWorkoutSessionService(userId: string, workoutId: string): Promise<ServiceResult<WorkoutSession>> {
  const plan = await trainingPlanRepository.findByUserId(userId);
  const workout = plan ? toPlan(plan).workouts.find(({ id }) => id === workoutId) : undefined;
  if (!workout) return { data: { error: 'NOT_FOUND' }, status: 404 };

  const from = new Date(Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const logs = await listWorkoutLogsService(userId, { from });
  if ('error' in logs.data) return { data: logs.data, status: logs.status };
  const history = logs.data;

  const exercises = workout.exercises.flatMap((exercise) => {
    const definition = WORKOUT_EXERCISE_LIBRARY.find(({ id }) => id === exercise.exerciseId);
    if (!definition) return [];
    const sessions: SetResult[][] = history.flatMap((log) => {
      const match = log.exercises.find(({ exerciseId }) => exerciseId === exercise.exerciseId);
      return match ? [match.sets] : [];
    });
    return [{ ...exercise, definition, target: suggestNextTarget(exercise, definition.region, sessions) }];
  });
  return { data: { workout, exercises }, status: 200 };
}
