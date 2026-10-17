import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/fitness/repository/fitness-profile.repository', () => ({
  fitnessProfileRepository: {
    findByUserId: vi.fn(),
    updateWorkoutPlanOverridesByUserId: vi.fn(),
  },
}));

import { fitnessProfileRepository } from '@/features/fitness/repository/fitness-profile.repository';
import { FitnessProfileModel } from '@/features/fitness/schema/fitness-profile.schema';
import {
  getWorkoutPlanCustomizationService,
  saveWorkoutPlanCustomizationService,
} from '@/features/fitness/service/workout-plan-customization.service';

const repository = vi.mocked(fitnessProfileRepository);
const USER_ID = '507f1f77bcf86cd799439011';
const profile = (
  overrides: { sessionIndex: number; exerciseIds: string[] }[] = [],
  availableEquipment: string[] = []
) =>
  FitnessProfileModel.hydrate({
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(USER_ID),
    goal: 'general-fitness',
    experience: 'beginner',
    trainingDaysPerWeek: 2,
    availableEquipment,
    trainingSchedule: [],
    workoutPlanOverrides: overrides,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('workout plan customization services', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses the generated plan when no profile exists', async () => {
    repository.findByUserId.mockResolvedValueOnce(null);

    const result = await getWorkoutPlanCustomizationService(USER_ID);

    expect(result).toEqual({
      data: { error: 'PROFILE_REQUIRED' },
      status: 400,
    });
  });

  it('falls back to generated movements when a saved choice is no longer compatible', async () => {
    repository.findByUserId.mockResolvedValueOnce(
      profile([
        {
          sessionIndex: 0,
          exerciseIds: [
            'dumbbell-row',
            'incline-push-up',
            'glute-bridge',
            'bird-dog',
          ],
        },
      ])
    );

    const result = await getWorkoutPlanCustomizationService(USER_ID);

    if ('error' in result.data) throw new Error(result.data.error);
    expect(result.data.plan.sessions[0].exercises.map(({ id }) => id)).toEqual([
      'bodyweight-squat',
      'incline-push-up',
      'glute-bridge',
      'bird-dog',
    ]);
  });

  it('rejects unknown sessions and exercises unavailable in the profile', async () => {
    repository.findByUserId.mockResolvedValueOnce(profile());
    const unavailable = await saveWorkoutPlanCustomizationService(USER_ID, {
      overrides: [
        {
          sessionIndex: 0,
          exerciseIds: [
            'dumbbell-row',
            'incline-push-up',
            'glute-bridge',
            'bird-dog',
          ],
        },
      ],
    });

    expect(unavailable).toMatchObject({
      data: { error: 'VALIDATION_ERROR' },
      status: 400,
    });
    expect(repository.updateWorkoutPlanOverridesByUserId).not.toHaveBeenCalled();

    repository.findByUserId.mockResolvedValueOnce(profile());
    const unknownSession = await saveWorkoutPlanCustomizationService(USER_ID, {
      overrides: [{ sessionIndex: 2, exerciseIds: ['bodyweight-squat'] }],
    });
    expect(unknownSession).toMatchObject({
      data: { error: 'VALIDATION_ERROR' },
      status: 400,
    });
  });

  it('saves compatible substitutions without changing session dosage', async () => {
    repository.findByUserId.mockResolvedValueOnce(profile());
    repository.updateWorkoutPlanOverridesByUserId.mockResolvedValueOnce(
      profile([
        {
          sessionIndex: 0,
          exerciseIds: [
            'reverse-lunge',
            'hip-hinge',
            'dead-bug',
            'glute-bridge',
          ],
        },
      ])
    );

    const result = await saveWorkoutPlanCustomizationService(USER_ID, {
      overrides: [
        {
          sessionIndex: 0,
          exerciseIds: [
            'reverse-lunge',
            'hip-hinge',
            'dead-bug',
            'glute-bridge',
          ],
        },
      ],
    });

    expect(repository.updateWorkoutPlanOverridesByUserId).toHaveBeenCalledWith(
      USER_ID,
      [
        {
          sessionIndex: 0,
          exerciseIds: [
            'reverse-lunge',
            'hip-hinge',
            'dead-bug',
            'glute-bridge',
          ],
        },
      ]
    );
    if ('error' in result.data) throw new Error(result.data.error);
    expect(result.data.plan.sessions[0].exercises.map(({ id }) => id)).toEqual([
      'reverse-lunge',
      'hip-hinge',
      'dead-bug',
      'glute-bridge',
    ]);
    expect(result.data.plan.sessions[0].exercises[0]).toMatchObject({
      sets: 2,
      repetitions: '8–12',
      restSeconds: 90,
    });
    expect(result.data.defaultPlan.sessions[0].exercises[0].id).toBe(
      'bodyweight-squat'
    );
  });

  it('clears saved customizations on reset', async () => {
    repository.findByUserId.mockResolvedValueOnce(profile());
    repository.updateWorkoutPlanOverridesByUserId.mockResolvedValueOnce(
      profile()
    );

    const result = await saveWorkoutPlanCustomizationService(USER_ID, {
      overrides: [],
    });

    expect(repository.updateWorkoutPlanOverridesByUserId).toHaveBeenCalledWith(
      USER_ID,
      []
    );
    if ('error' in result.data) throw new Error(result.data.error);
    expect(result.data.plan.sessions[0].exercises[0].id).toBe(
      'bodyweight-squat'
    );
  });
});
