import { fitnessProfileRepository } from '@/features/fitness/repository/fitness-profile.repository';
import type { FitnessProfile } from '@/features/fitness/service/fitness-profile.service';
import { createWorkoutPlanService } from '@/features/fitness/service/workout-plan.service';
import type { TrainingScheduleInput } from '@/features/fitness/validations/training-schedule.validation';
import type { ServiceResult } from '@/shared/types/common';

type SavedAssignment = TrainingScheduleInput['assignments'][number];

export type TrainingScheduleAssignment = SavedAssignment & {
  sessionTitle: string;
};

export type TrainingSchedule = {
  sessions: { sessionIndex: number; title: string }[];
  assignments: TrainingScheduleAssignment[];
};

const toTrainingProfile = (
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

export async function getTrainingScheduleService(
  userId: string
): Promise<ServiceResult<TrainingSchedule>> {
  const document = await fitnessProfileRepository.findByUserId(userId);
  const profile = toTrainingProfile(document);
  if (!document || !profile) {
    return { data: { sessions: [], assignments: [] }, status: 200 };
  }

  const planResult = createWorkoutPlanService(profile);
  if ('error' in planResult.data) {
    return { data: { error: planResult.data.error }, status: planResult.status };
  }

  const sessions = planResult.data.sessions.map(({ title }, sessionIndex) => ({
    sessionIndex,
    title,
  }));
  const assignments = (document.trainingSchedule ?? [])
    .filter(({ sessionIndex }) => sessionIndex < sessions.length)
    .map(({ weekday, sessionIndex }) => ({
      weekday,
      sessionIndex,
      sessionTitle: sessions[sessionIndex].title,
    }));

  return { data: { sessions, assignments }, status: 200 };
}

export async function saveTrainingScheduleService(
  userId: string,
  input: TrainingScheduleInput
): Promise<ServiceResult<TrainingSchedule>> {
  const document = await fitnessProfileRepository.findByUserId(userId);
  const profile = toTrainingProfile(document);
  if (!document || !profile) {
    return { data: { error: 'PROFILE_REQUIRED' }, status: 400 };
  }

  const planResult = createWorkoutPlanService(profile);
  const planSessions =
    'sessions' in planResult.data ? planResult.data.sessions : null;
  if (!planSessions) {
    return { data: { error: 'VALIDATION_ERROR' }, status: 400 };
  }
  if (input.assignments.some(({ sessionIndex }) => sessionIndex >= planSessions.length)) {
    return { data: { error: 'VALIDATION_ERROR' }, status: 400 };
  }

  const updated = await fitnessProfileRepository.updateTrainingScheduleByUserId(
    userId,
    input.assignments
  );
  if (!updated) return { data: { error: 'INTERNAL_ERROR' }, status: 500 };

  const sessions = planSessions.map(({ title }, sessionIndex) => ({
    sessionIndex,
    title,
  }));
  const assignments = input.assignments.map(({ weekday, sessionIndex }) => ({
    weekday,
    sessionIndex,
    sessionTitle: sessions[sessionIndex].title,
  }));
  return { data: { sessions, assignments }, status: 200 };
}
