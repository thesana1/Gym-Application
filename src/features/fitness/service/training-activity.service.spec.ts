import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/fitness/repository/workout-log.repository', () => ({
  workoutLogRepository: { findByUserId: vi.fn() },
}));

import { workoutLogRepository } from '@/features/fitness/repository/workout-log.repository';
import {
  getTrainingActivityService,
  isAllowedTrainingActivityWeeks,
} from '@/features/fitness/service/training-activity.service';

const mockFindByUserId = vi.mocked(workoutLogRepository.findByUserId);
const USER_ID = '507f1f77bcf86cd799439011';

const workout = (
  id: string,
  completedAt: string,
  exercises: {
    exerciseId: string;
    sets: { repetitions: number; weightKg?: number }[];
  }[]
) =>
  ({
    _id: { toString: () => id },
    completedAt: new Date(completedAt),
    exercises,
  }) as never;

describe('getTrainingActivityService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates adjacent rolling seven-day periods and counts only logged values', async () => {
    const now = new Date('2026-10-17T12:00:00.000Z');
    mockFindByUserId.mockResolvedValueOnce([
      workout('first', '2026-09-19T12:00:00.000Z', [
        {
          exerciseId: 'squat',
          sets: [{ repetitions: 10 }, { repetitions: 8, weightKg: 20 }],
        },
        { exerciseId: 'row', sets: [{ repetitions: 12 }] },
      ]),
      workout('second', '2026-09-26T12:00:00.000Z', [
        { exerciseId: 'squat', sets: [{ repetitions: 9 }] },
      ]),
      workout('latest', '2026-10-17T11:59:59.999Z', [
        { exerciseId: 'press', sets: [{ repetitions: 6, weightKg: 30 }] },
      ]),
      workout('at-end', '2026-10-17T12:00:00.000Z', [
        { exerciseId: 'press', sets: [{ repetitions: 6 }] },
      ]),
    ]);

    const result = await getTrainingActivityService(USER_ID, 4, now);

    expect(mockFindByUserId).toHaveBeenCalledWith(USER_ID, {
      from: '2026-09-19T12:00:00.000Z',
      to: '2026-10-17T12:00:00.000Z',
    });
    if ('error' in result.data) throw new Error(result.data.error);
    expect(result.data.periods).toEqual([
      {
        start: '2026-09-19T12:00:00.000Z',
        end: '2026-09-26T12:00:00.000Z',
        workoutCount: 1,
        setCount: 3,
        distinctExerciseCount: 2,
      },
      {
        start: '2026-09-26T12:00:00.000Z',
        end: '2026-10-03T12:00:00.000Z',
        workoutCount: 1,
        setCount: 1,
        distinctExerciseCount: 1,
      },
      {
        start: '2026-10-03T12:00:00.000Z',
        end: '2026-10-10T12:00:00.000Z',
        workoutCount: 0,
        setCount: 0,
        distinctExerciseCount: 0,
      },
      {
        start: '2026-10-10T12:00:00.000Z',
        end: '2026-10-17T12:00:00.000Z',
        workoutCount: 1,
        setCount: 1,
        distinctExerciseCount: 1,
      },
    ]);
  });

  it('accepts only the published 4- and 8-week ranges', () => {
    expect(isAllowedTrainingActivityWeeks(4)).toBe(true);
    expect(isAllowedTrainingActivityWeeks(8)).toBe(true);
    expect(isAllowedTrainingActivityWeeks(0)).toBe(false);
    expect(isAllowedTrainingActivityWeeks(52)).toBe(false);
  });

  it('returns empty periods when the member has no logs', async () => {
    mockFindByUserId.mockResolvedValueOnce([]);

    const result = await getTrainingActivityService(
      USER_ID,
      4,
      new Date('2026-10-17T12:00:00.000Z')
    );

    if ('error' in result.data) throw new Error(result.data.error);
    expect(result.data.periods).toHaveLength(4);
    expect(result.data.periods.every(({ workoutCount, setCount }) =>
      workoutCount === 0 && setCount === 0
    )).toBe(true);
  });

  it('creates eight periods when requested', async () => {
    mockFindByUserId.mockResolvedValueOnce([]);

    const result = await getTrainingActivityService(
      USER_ID,
      8,
      new Date('2026-10-17T12:00:00.000Z')
    );

    if ('error' in result.data) throw new Error(result.data.error);
    expect(result.data.weeks).toBe(8);
    expect(result.data.periods).toHaveLength(8);
    expect(result.data.periods[0].start).toBe('2026-08-22T12:00:00.000Z');
    expect(result.data.periods[7].end).toBe('2026-10-17T12:00:00.000Z');
  });
});
