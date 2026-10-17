import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/fitness/repository/fitness-profile.repository', () => ({
  fitnessProfileRepository: {
    findByUserId: vi.fn(),
    upsertByUserId: vi.fn(),
  },
}));

import { fitnessProfileRepository } from '@/features/fitness/repository/fitness-profile.repository';
import {
  getFitnessProfileService,
  saveFitnessProfileService,
} from '@/features/fitness/service/fitness-profile.service';
import { FitnessProfileSchema } from '@/features/fitness/validations/fitness-profile.validation';


const mockRepository = vi.mocked(fitnessProfileRepository);

describe('fitness profile service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns an empty profile when the signed-in user has not set one', async () => {
    mockRepository.findByUserId.mockResolvedValueOnce(null);

    const result = await getFitnessProfileService('user-one');

    expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-one');
    expect(result).toEqual({ data: null, status: 200 });
  });

  it('does not expose database identity fields in profile responses', async () => {
    mockRepository.findByUserId.mockResolvedValueOnce({
      userId: 'user-one',
      goal: 'strength',
      experience: 'intermediate',
      age: 30,
      heightCm: 180,
      weightKg: 80,
      trainingDaysPerWeek: 4,
      availableEquipment: ['barbell'],
      _id: 'profile-one',
    } as never);

    const result = await getFitnessProfileService('user-one');

    expect(result.data).toEqual({
      goal: 'strength',
      experience: 'intermediate',
      age: 30,
      heightCm: 180,
      weightKg: 80,
      trainingDaysPerWeek: 4,
      availableEquipment: ['barbell'],
    });
  });

  it('saves a profile under the authenticated user id', async () => {
    const profile = FitnessProfileSchema.parse({
      goal: 'general-fitness',
      experience: 'beginner',
      age: '',
      heightCm: '',
      weightKg: '',
      trainingDaysPerWeek: '',
      availableEquipment: [],
    });
    mockRepository.upsertByUserId.mockResolvedValueOnce({
      userId: 'user-two',
      ...profile,
      _id: 'profile-two',
    } as never);

    const result = await saveFitnessProfileService('user-two', profile);

    expect(mockRepository.upsertByUserId).toHaveBeenCalledWith('user-two', profile);
    expect(result.status).toBe(200);
    expect(result.data).toMatchObject({ goal: 'general-fitness' });
  });
});
