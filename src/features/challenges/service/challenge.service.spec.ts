import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/challenges/repository/challenge.repository', () => ({
  challengeRepository: {
    findByUserId: vi.fn(),
    join: vi.fn(),
    leave: vi.fn(),
  },
}));
vi.mock('@/features/fitness/repository/workout-log.repository', () => ({
  workoutLogRepository: {
    findByUserId: vi.fn(),
  },
}));

import { challengeRepository } from '@/features/challenges/repository/challenge.repository';
import {
  joinPersonalChallengeService,
  leavePersonalChallengeService,
  listPersonalChallengesService,
} from '@/features/challenges/service/challenge.service';
import { workoutLogRepository } from '@/features/fitness/repository/workout-log.repository';

const mockChallenges = vi.mocked(challengeRepository);
const mockWorkoutLogs = vi.mocked(workoutLogRepository);
const USER_ID = '507f1f77bcf86cd799439011';

const enrollment = (challengeId: string, joinedAt: string) =>
  ({
    challengeId,
    joinedAt: new Date(joinedAt),
  }) as never;

const workout = (completedAt: string) =>
  ({ completedAt: new Date(completedAt) }) as never;

describe('personal workout challenges', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists available challenges without fetching workout history when none are joined', async () => {
    mockChallenges.findByUserId.mockResolvedValueOnce([]);

    const result = await listPersonalChallengesService(
      USER_ID,
      new Date('2026-10-05T00:00:00.000Z')
    );

    expect(result.status).toBe(200);
    if ('error' in result.data) throw new Error(result.data.error);
    expect(result.data).toHaveLength(3);
    expect(result.data.every(({ status }) => status === 'not-joined')).toBe(true);
    expect(mockWorkoutLogs.findByUserId).not.toHaveBeenCalled();
  });

  it('derives private progress only from the account owner logs and within the challenge period', async () => {
    mockChallenges.findByUserId.mockResolvedValueOnce([
      enrollment('start-a-routine', '2026-10-01T12:00:00.000Z'),
    ]);
    mockWorkoutLogs.findByUserId.mockResolvedValueOnce([
      workout('2026-10-01T13:00:00.000Z'),
      workout('2026-10-03T13:00:00.000Z'),
      workout('2026-10-08T13:00:00.000Z'),
      workout('2026-10-10T13:00:00.000Z'),
    ]);

    const result = await listPersonalChallengesService(
      USER_ID,
      new Date('2026-10-05T00:00:00.000Z')
    );

    expect(mockWorkoutLogs.findByUserId).toHaveBeenCalledWith(USER_ID, {
      from: '2026-10-01T12:00:00.000Z',
      to: '2026-10-05T00:00:00.000Z',
    });
    if ('error' in result.data) throw new Error(result.data.error);
    expect(result.data[0]).toMatchObject({
      id: 'start-a-routine',
      status: 'completed',
      completedWorkouts: 2,
      targetWorkouts: 2,
    });
  });

  it('marks incomplete challenges expired after their deadline', async () => {
    mockChallenges.findByUserId.mockResolvedValueOnce([
      enrollment('start-a-routine', '2026-10-01T00:00:00.000Z'),
    ]);
    mockWorkoutLogs.findByUserId.mockResolvedValueOnce([
      workout('2026-10-02T12:00:00.000Z'),
    ]);

    const result = await listPersonalChallengesService(
      USER_ID,
      new Date('2026-10-09T00:00:00.000Z')
    );

    if ('error' in result.data) throw new Error(result.data.error);
    expect(result.data[0]).toMatchObject({
      status: 'expired',
      completedWorkouts: 1,
      endsAt: '2026-10-08T00:00:00.000Z',
    });
  });

  it('joins and leaves only the requested user challenge enrollment', async () => {
    mockChallenges.join.mockResolvedValueOnce(
      enrollment('build-consistency', '2026-10-05T00:00:00.000Z')
    );
    mockChallenges.leave.mockResolvedValueOnce(true);

    const joined = await joinPersonalChallengeService(
      USER_ID,
      'build-consistency',
      new Date('2026-10-05T00:00:00.000Z')
    );
    const left = await leavePersonalChallengeService(
      USER_ID,
      'build-consistency'
    );

    expect(joined.status).toBe(200);
    expect(mockChallenges.join).toHaveBeenCalledWith(
      USER_ID,
      'build-consistency',
      new Date('2026-10-05T00:00:00.000Z')
    );
    expect(left).toEqual({ data: { left: true }, status: 200 });
    expect(mockChallenges.leave).toHaveBeenCalledWith(
      USER_ID,
      'build-consistency'
    );
  });

  it('returns not found when leaving an enrollment that does not exist', async () => {
    mockChallenges.leave.mockResolvedValueOnce(false);

    const result = await leavePersonalChallengeService(
      USER_ID,
      'build-consistency'
    );

    expect(result).toEqual({ data: { error: 'NOT_FOUND' }, status: 404 });
  });
});
