import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/fitness/repository/workout-log.repository', () => ({
  workoutLogRepository: {
    findByUserId: vi.fn(),
    create: vi.fn(),
    updateById: vi.fn(),
    deleteById: vi.fn(),
  },
}));

import { workoutLogRepository } from '@/features/fitness/repository/workout-log.repository';
import {
  createWorkoutLogService,
  deleteWorkoutLogService,
  listWorkoutLogsService,
  updateWorkoutLogService,
} from '@/features/fitness/service/workout-log.service';
import { WorkoutLogSchema } from '@/features/fitness/validations/workout-log.validation';


const mockRepository = vi.mocked(workoutLogRepository);

const makeDocument = (overrides: Record<string, unknown> = {}) =>
  ({
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    userId: 'user-one',
    title: 'Strength session',
    completedAt: new Date('2026-10-04T05:00:00.000Z'),
    notes: undefined,
    exercises: [
      {
        exerciseId: 'bodyweight-squat',
        exerciseName: 'Bodyweight squat',
        sets: [{ repetitions: 10, weightKg: null }],
      },
    ],
    ...overrides,
  }) as never;

const input = WorkoutLogSchema.parse({
  title: 'Strength session',
  completedAt: '2026-10-04T05:00:00.000Z',
  exercises: [
    {
      exerciseId: 'bodyweight-squat',
      sets: [{ repetitions: '10' }],
    },
  ],
});

describe('workout log service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists only records requested for the current user and applies filters', async () => {
    const query = { exerciseId: 'bodyweight-squat' };
    mockRepository.findByUserId.mockResolvedValueOnce([makeDocument()]);

    const result = await listWorkoutLogsService('user-one', query);

    expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-one', query);
    expect(result.data).toMatchObject([
      {
        id: '507f1f77bcf86cd799439011',
        title: 'Strength session',
        exercises: [
          {
            exerciseName: 'Bodyweight squat',
            sets: [{ repetitions: 10 }],
          },
        ],
      },
    ]);
  });

  it('creates an authenticated user workout and derives the exercise name', async () => {
    mockRepository.create.mockResolvedValueOnce([makeDocument()][0]);

    const result = await createWorkoutLogService('user-one', input);

    expect(mockRepository.create).toHaveBeenCalledWith(
      'user-one',
      expect.objectContaining({
        title: 'Strength session',
        exercises: [
          expect.objectContaining({
            exerciseId: 'bodyweight-squat',
            exerciseName: 'Bodyweight squat',
          }),
        ],
      })
    );
    expect(result.status).toBe(201);
    expect(result.data).toMatchObject({ title: 'Strength session' });
  });

  it('updates and deletes only the specified user-owned workout', async () => {
    mockRepository.updateById.mockResolvedValueOnce(makeDocument());
    mockRepository.deleteById.mockResolvedValueOnce(true);

    const updated = await updateWorkoutLogService(
      'user-two',
      '507f1f77bcf86cd799439011',
      input
    );
    const deleted = await deleteWorkoutLogService(
      'user-two',
      '507f1f77bcf86cd799439011'
    );

    expect(mockRepository.updateById).toHaveBeenCalledWith(
      'user-two',
      '507f1f77bcf86cd799439011',
      expect.any(Object)
    );
    expect(mockRepository.deleteById).toHaveBeenCalledWith(
      'user-two',
      '507f1f77bcf86cd799439011'
    );
    expect(updated.status).toBe(200);
    expect(deleted.data).toEqual({ deleted: true });
  });

  it('returns not found if a workout is not owned by the user', async () => {
    mockRepository.updateById.mockResolvedValueOnce(null);
    mockRepository.deleteById.mockResolvedValueOnce(false);

    const updated = await updateWorkoutLogService(
      'user-two',
      '507f1f77bcf86cd799439011',
      input
    );
    const deleted = await deleteWorkoutLogService(
      'user-two',
      '507f1f77bcf86cd799439011'
    );

    expect(updated).toMatchObject({ status: 404, data: { error: 'NOT_FOUND' } });
    expect(deleted).toMatchObject({ status: 404, data: { error: 'NOT_FOUND' } });
  });
});
