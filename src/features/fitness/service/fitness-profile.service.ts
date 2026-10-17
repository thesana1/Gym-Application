import { fitnessProfileRepository } from '@/features/fitness/repository/fitness-profile.repository';
import { FitnessProfileDocument } from '@/features/fitness/schema/fitness-profile.schema';
import { FitnessProfileType } from '@/features/fitness/validations/fitness-profile.validation';
import { ServiceResult } from '@/shared/types/common';

export type FitnessProfile = Omit<
  FitnessProfileDocument,
  | '_id'
  | 'userId'
  | 'createdAt'
  | 'updatedAt'
  | 'trainingSchedule'
  | 'workoutPlanOverrides'
>;

const toFitnessProfile = (document: FitnessProfileDocument): FitnessProfile => ({
  goal: document.goal,
  experience: document.experience,
  age: document.age ?? undefined,
  heightCm: document.heightCm ?? undefined,
  weightKg: document.weightKg ?? undefined,
  trainingDaysPerWeek: document.trainingDaysPerWeek ?? undefined,
  availableEquipment: document.availableEquipment,
});

export async function getFitnessProfileService(
  userId: string
): Promise<ServiceResult<FitnessProfile | null>> {
  const profile = await fitnessProfileRepository.findByUserId(userId);
  return { data: profile ? toFitnessProfile(profile) : null, status: 200 };
}

export async function saveFitnessProfileService(
  userId: string,
  input: FitnessProfileType
): Promise<ServiceResult<FitnessProfile>> {
  const profile = await fitnessProfileRepository.upsertByUserId(userId, input);
  if (!profile) return { data: { error: 'INTERNAL_ERROR' }, status: 500 };
  return { data: toFitnessProfile(profile), status: 200 };
}
