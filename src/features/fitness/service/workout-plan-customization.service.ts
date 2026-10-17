import { fitnessProfileRepository } from '@/features/fitness/repository/fitness-profile.repository';
import type { FitnessProfile } from '@/features/fitness/service/fitness-profile.service';
import {
  applyWorkoutPlanOverrides,
  createWorkoutPlanService,
  getAvailableExercisesForProfile,
  type WorkoutPlan,
  type WorkoutPlanOverride,
} from '@/features/fitness/service/workout-plan.service';
import type { WorkoutPlanCustomizationInput } from '@/features/fitness/validations/workout-plan-customization.validation';
import type { ServiceResult } from '@/shared/types/common';

export type WorkoutPlanCustomization = {
  plan: WorkoutPlan;
  defaultPlan: WorkoutPlan;
  options: ReturnType<typeof getAvailableExercisesForProfile>;
};

const toFitnessProfile = (
  document: Awaited<ReturnType<typeof fitnessProfileRepository.findByUserId>>
): FitnessProfile | null => {
  if (!document) return null;
  return {
    goal: document.goal,
    experience: document.experience,
    age: document.age ?? undefined,
    heightCm: document.heightCm ?? undefined,
    weightKg: document.weightKg ?? undefined,
    trainingDaysPerWeek: document.trainingDaysPerWeek ?? undefined,
    availableEquipment: document.availableEquipment,
  };
};

const buildCustomization = (
  profile: FitnessProfile,
  overrides: WorkoutPlanOverride[]
): ServiceResult<WorkoutPlanCustomization> => {
  const defaultResult = createWorkoutPlanService(profile);
  const defaultPlan =
    'sessions' in defaultResult.data ? defaultResult.data : null;
  if (!defaultPlan) {
    return {
      data: { error: 'VALIDATION_ERROR' },
      status: 400,
    };
  }
  const customizedResult = applyWorkoutPlanOverrides(profile, overrides);
  if ('error' in customizedResult.data) {
    return {
      data: { error: customizedResult.data.error },
      status: customizedResult.status,
    };
  }
  const plan =
    'sessions' in customizedResult.data ? customizedResult.data : null;
  if (!plan) {
    return { data: { error: 'VALIDATION_ERROR' }, status: 400 };
  }

  return {
    data: {
      defaultPlan,
      plan,
      options: getAvailableExercisesForProfile(profile),
    },
    status: 200,
  };
};

export async function getWorkoutPlanCustomizationService(
  userId: string
): Promise<ServiceResult<WorkoutPlanCustomization>> {
  const document = await fitnessProfileRepository.findByUserId(userId);
  const profile = toFitnessProfile(document);
  if (!document || !profile) {
    return { data: { error: 'PROFILE_REQUIRED' }, status: 400 };
  }

  return buildCustomization(
    profile,
    document.workoutPlanOverrides ?? []
  );
}

export async function saveWorkoutPlanCustomizationService(
  userId: string,
  input: WorkoutPlanCustomizationInput
): Promise<ServiceResult<WorkoutPlanCustomization>> {
  const document = await fitnessProfileRepository.findByUserId(userId);
  const profile = toFitnessProfile(document);
  if (!document || !profile) {
    return { data: { error: 'PROFILE_REQUIRED' }, status: 400 };
  }
  const defaultResult = createWorkoutPlanService(profile);
  const defaultPlan =
    'sessions' in defaultResult.data ? defaultResult.data : null;
  if (!defaultPlan) {
    return { data: { error: 'VALIDATION_ERROR' }, status: 400 };
  }
  const availableExerciseIds = new Set(
    getAvailableExercisesForProfile(profile).map(({ id }) => id)
  );
  const invalidOverride = input.overrides.some(
    ({ sessionIndex, exerciseIds }) =>
      sessionIndex >= defaultPlan.sessions.length ||
      exerciseIds.length !==
        defaultPlan.sessions[sessionIndex]?.exercises.length ||
      exerciseIds.some((id) => !availableExerciseIds.has(id))
  );
  if (invalidOverride) {
    return { data: { error: 'VALIDATION_ERROR' }, status: 400 };
  }

  const updated = await fitnessProfileRepository.updateWorkoutPlanOverridesByUserId(
    userId,
    input.overrides
  );
  if (!updated) return { data: { error: 'INTERNAL_ERROR' }, status: 500 };

  return buildCustomization(profile, input.overrides);
}
