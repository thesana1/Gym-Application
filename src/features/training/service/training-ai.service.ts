import { getAiUsageService, runAiRequestService } from '@/features/ai/service/ai-request.service';
import { getFitnessProfileService } from '@/features/fitness/service/fitness-profile.service';
import { availableExercises, buildLibraryPlan, planExerciseDefaults, type PlanContext } from '@/features/training/service/training-library.service';
import { AiTrainingPlanSchema, AiWorkoutTipSchema, type WorkoutTipRequest } from '@/features/training/validations/training-ai.validation';
import type { PlanPrioritiesType, TrainingPlanType } from '@/features/training/validations/training-plan.validation';
import { AI_PROMPTS } from '@/shared/const/ai.const';
import { TRAINING_LIMITS } from '@/shared/const/training.const';
import type { AiSource, AiUsage } from '@/shared/types/ai';
import type { ServiceResult } from '@/shared/types/common';

export type PlanSuggestion = { plan: TrainingPlanType; source: AiSource; summary?: string; notice?: string; usage: AiUsage | null };

const getContext = async (userId: string): Promise<PlanContext | null> => {
  const profile = await getFitnessProfileService(userId);
  if (!profile.data || 'error' in profile.data) return null;
  return { experience: profile.data.experience, equipment: profile.data.availableEquipment };
};

const byMondayFirst = (days: number[]) => [...days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));

export async function suggestTrainingPlanService(userId: string, priorities: PlanPrioritiesType): Promise<ServiceResult<PlanSuggestion>> {
  const context = await getContext(userId);
  if (!context) return { data: { error: 'PROFILE_REQUIRED' }, status: 409 };

  const options = availableExercises(context.equipment);
  const weekdays = byMondayFirst(priorities.weekdays);
  const request = {
    goal: priorities.goal, experience: context.experience, focusAreas: [...priorities.focusAreas].sort(), days: weekdays.length,
    availableExercises: options.map(({ id, name, focus }) => ({ id, name, focus })),
  };
  const result = await runAiRequestService({
    userId, kind: 'workout-plan', scope: 'user', cacheInput: JSON.stringify(request), label: `${weekdays.length} days · ${priorities.goal}`,
    schema: AiTrainingPlanSchema, schemaName: 'training_plan', system: AI_PROMPTS.workoutPlan, user: `<user_input>${JSON.stringify(request)}</user_input>`,
  });

  const fallback = async (notice: string): Promise<ServiceResult<PlanSuggestion>> => {
    const usage = await getAiUsageService(userId);
    return { data: { plan: buildLibraryPlan(priorities, context), source: 'library', notice, usage: 'error' in usage.data ? null : usage.data }, status: 200 };
  };
  if ('error' in result.data) return fallback(result.data.error);

  // Never trust ids from the model: keep only exercises this person can do, once each per workout.
  const byId = new Map(options.map((exercise) => [exercise.id, exercise]));
  const workouts = result.data.data.workouts.slice(0, weekdays.length).map((workout, index) => ({
    id: `w${index + 1}`,
    name: workout.name.trim().slice(0, TRAINING_LIMITS.maxNameLength),
    weekday: weekdays[index] ?? null,
    exercises: [...new Set(workout.exerciseIds)].flatMap((id) => {
      const exercise = byId.get(id);
      return exercise ? [planExerciseDefaults(exercise, priorities.goal, context.experience)] : [];
    }).slice(0, TRAINING_LIMITS.maxExercises),
  }));
  if (workouts.length !== weekdays.length || workouts.some(({ exercises }) => exercises.length < 2)) return fallback('AI_INVALID_OUTPUT');

  return {
    data: {
      plan: { goal: priorities.goal, focusAreas: priorities.focusAreas, source: 'ai', workouts },
      source: result.data.source, summary: result.data.data.summary, usage: result.data.usage,
    },
    status: 200,
  };
}

export async function workoutTipService(userId: string, input: WorkoutTipRequest): Promise<ServiceResult<{ tip: string; usage: AiUsage }>> {
  const result = await runAiRequestService({
    userId, kind: 'workout-tip', scope: 'user', cacheInput: JSON.stringify(input), label: input.workoutName,
    schema: AiWorkoutTipSchema, schemaName: 'workout_tip', system: AI_PROMPTS.workoutTip, user: `<user_input>${JSON.stringify(input)}</user_input>`,
  });
  if ('error' in result.data) return { data: result.data, status: result.status };
  return { data: { tip: result.data.data.tip, usage: result.data.usage }, status: 200 };
}
