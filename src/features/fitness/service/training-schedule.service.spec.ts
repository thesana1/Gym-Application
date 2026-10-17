import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/fitness/repository/fitness-profile.repository', () => ({
  fitnessProfileRepository: {
    findByUserId: vi.fn(),
    updateTrainingScheduleByUserId: vi.fn(),
  },
}));

import { fitnessProfileRepository } from '@/features/fitness/repository/fitness-profile.repository';
import { FitnessProfileModel } from '@/features/fitness/schema/fitness-profile.schema';
import {
  getTrainingScheduleService,
  saveTrainingScheduleService,
} from '@/features/fitness/service/training-schedule.service';

const repository = vi.mocked(fitnessProfileRepository);
const USER_ID = '507f1f77bcf86cd799439011';
const profile = (trainingSchedule: { weekday: number; sessionIndex: number }[] = []) =>
  FitnessProfileModel.hydrate({
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(USER_ID),
    goal: 'general-fitness',
    experience: 'beginner',
    trainingDaysPerWeek: 2,
    availableEquipment: [],
    trainingSchedule,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('training schedule services', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns only saved assignments that exist in the current plan', async () => {
    repository.findByUserId.mockResolvedValueOnce(
      profile([
        { weekday: 1, sessionIndex: 0 },
        { weekday: 4, sessionIndex: 1 },
        { weekday: 6, sessionIndex: 2 },
      ])
    );

    const result = await getTrainingScheduleService(USER_ID);

    if ('error' in result.data) throw new Error(result.data.error);
    expect(result.data.sessions).toHaveLength(2);
    expect(result.data.assignments).toEqual([
      { weekday: 1, sessionIndex: 0, sessionTitle: 'Full body A' },
      { weekday: 4, sessionIndex: 1, sessionTitle: 'Full body B' },
    ]);
  });

  it('returns an empty schedule when the member has no profile', async () => {
    repository.findByUserId.mockResolvedValueOnce(null);

    const result = await getTrainingScheduleService(USER_ID);

    expect(result).toEqual({
      data: { sessions: [], assignments: [] },
      status: 200,
    });
  });

  it('rejects assignments outside the generated plan', async () => {
    repository.findByUserId.mockResolvedValueOnce(profile());

    const result = await saveTrainingScheduleService(USER_ID, {
      assignments: [{ weekday: 1, sessionIndex: 2 }],
    });

    expect(result).toEqual({
      data: { error: 'VALIDATION_ERROR' },
      status: 400,
    });
    expect(repository.updateTrainingScheduleByUserId).not.toHaveBeenCalled();
  });

  it('persists a valid partial schedule for the current member', async () => {
    repository.findByUserId.mockResolvedValueOnce(profile());
    repository.updateTrainingScheduleByUserId.mockResolvedValueOnce(
      profile([{ weekday: 3, sessionIndex: 0 }])
    );

    const result = await saveTrainingScheduleService(USER_ID, {
      assignments: [{ weekday: 3, sessionIndex: 0 }],
    });

    expect(repository.updateTrainingScheduleByUserId).toHaveBeenCalledWith(
      USER_ID,
      [{ weekday: 3, sessionIndex: 0 }]
    );
    expect(result).toMatchObject({
      status: 200,
      data: {
        assignments: [
          { weekday: 3, sessionIndex: 0, sessionTitle: 'Full body A' },
        ],
      },
    });
  });
});
