import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/fitness/repository/workout-log.repository', () => ({
  workoutLogRepository: { findByUserId: vi.fn() },
}));

import { workoutLogRepository } from '@/features/fitness/repository/workout-log.repository';
import { listPersonalRecordsService } from '@/features/fitness/service/personal-record.service';

const mockFindByUserId = vi.mocked(workoutLogRepository.findByUserId);
const USER_ID = '507f1f77bcf86cd799439011';

const workout = (
  id: string,
  completedAt: string,
  sets: {
    repetitions: number;
    weightKg?: number | null;
  }[],
  duplicateExercise = false
) =>
  ({
    _id: { toString: () => id },
    completedAt: new Date(completedAt),
    exercises: [
      {
        exerciseId: 'dumbbell-row',
        exerciseName: 'Supported dumbbell row',
        sets,
      },
      ...(duplicateExercise
        ? [
          {
            exerciseId: 'dumbbell-row',
            exerciseName: 'Supported dumbbell row',
            sets,
          },
        ]
        : []),
    ],
  }) as never;

describe('listPersonalRecordsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('derives heaviest load and highest reps as separate exact logged records', async () => {
    mockFindByUserId.mockResolvedValueOnce([
      workout('1', '2026-10-01T10:00:00.000Z', [
        { repetitions: 12, weightKg: 10 },
        { repetitions: 18 },
      ]),
      workout('2', '2026-10-05T10:00:00.000Z', [
        { repetitions: 8, weightKg: 15 },
        { repetitions: 20, weightKg: 5 },
      ]),
    ]);

    const result = await listPersonalRecordsService(USER_ID);

    expect(mockFindByUserId).toHaveBeenCalledWith(USER_ID, {});
    expect(result.status).toBe(200);
    expect(result.data).toEqual([
      {
        exerciseId: 'dumbbell-row',
        exerciseName: 'Supported dumbbell row',
        heaviestSet: {
          weightKg: 15,
          repetitions: 8,
          completedAt: '2026-10-05T10:00:00.000Z',
        },
        highestRepSet: {
          repetitions: 20,
          weightKg: 5,
          completedAt: '2026-10-05T10:00:00.000Z',
        },
        workoutCount: 2,
      },
    ]);
  });

  it('keeps unweighted repetition records distinct from loaded sets', async () => {
    mockFindByUserId.mockResolvedValueOnce([
      workout('1', '2026-10-01T10:00:00.000Z', [{ repetitions: 30 }]),
      workout('2', '2026-10-05T10:00:00.000Z', [
        { repetitions: 10, weightKg: 20 },
      ]),
    ]);

    const result = await listPersonalRecordsService(USER_ID);

    expect(result.data).toMatchObject([
      {
        heaviestSet: {
          weightKg: 20,
          repetitions: 10,
        },
        highestRepSet: { repetitions: 30 },
      },
    ]);
    if ('error' in result.data) throw new Error(result.data.error);
    expect(result.data[0]?.highestRepSet).not.toHaveProperty('weightKg');
  });

  it('recalculates from current history and returns no records for empty history', async () => {
    mockFindByUserId.mockResolvedValueOnce([]);

    const result = await listPersonalRecordsService(USER_ID);

    expect(result).toEqual({ data: [], status: 200 });
  });

  it('uses the most recent workout date when a tied heaviest set is logged', async () => {
    mockFindByUserId.mockResolvedValueOnce([
      workout('1', '2026-10-01T10:00:00.000Z', [
        { repetitions: 8, weightKg: 20 },
      ]),
      workout('2', '2026-10-05T10:00:00.000Z', [
        { repetitions: 6, weightKg: 20 },
      ]),
    ]);

    const result = await listPersonalRecordsService(USER_ID);

    expect(result.data).toMatchObject([
      {
        heaviestSet: {
          weightKg: 20,
          repetitions: 6,
          completedAt: '2026-10-05T10:00:00.000Z',
        },
      },
    ]);
  });

  it('counts a workout once when the same exercise appears multiple times', async () => {
    mockFindByUserId.mockResolvedValueOnce([
      workout(
        '1',
        '2026-10-01T10:00:00.000Z',
        [{ repetitions: 10 }],
        true
      ),
    ]);

    const result = await listPersonalRecordsService(USER_ID);

    expect(result.data).toMatchObject([{ workoutCount: 1 }]);
  });
});
