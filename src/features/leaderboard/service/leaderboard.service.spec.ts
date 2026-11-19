import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { leaderboardRepository } from '@/features/leaderboard/repository/leaderboard.repository';
import { getLeaderboardsService, progressScores, rankScores, shortName } from '@/features/leaderboard/service/leaderboard.service';
import type { Leaderboards } from '@/features/leaderboard/types/leaderboard.types';

vi.mock('@/features/leaderboard/repository/leaderboard.repository', () => ({
  leaderboardRepository: { findHeaviestByUser: vi.fn(), findBestEstimates: vi.fn(), findNames: vi.fn() },
}));

const ids = Array.from({ length: 105 }, () => new Types.ObjectId());

describe('leaderboard helpers', () => {
  it('shortens names to first name and last initial', () => {
    expect(shortName('Giorgi Sanadiradze')).toBe('Giorgi S.');
    expect(shortName('  ana  ')).toBe('ana');
    expect(shortName('Mary Ann lee')).toBe('Mary L.');
  });

  it('gives equal scores the same place', () => {
    const ranked = rankScores([{ userId: 'a', value: 100 }, { userId: 'b', value: 120 }, { userId: 'c', value: 100 }, { userId: 'd', value: 90 }]);
    expect(ranked.map((score) => [score.userId, score.rank])).toEqual([['b', 1], ['a', 2], ['c', 2], ['d', 4]]);
  });

  it('averages the % gain only over lifts done both before and this month', () => {
    const row = (userId: string, exerciseId: string, recent: boolean, best: number) => ({ _id: { userId, exerciseId, recent }, best });
    expect(progressScores([
      row('a', 'squat', false, 100), row('a', 'squat', true, 110),
      row('a', 'bench', false, 50), row('a', 'bench', true, 60),
      row('a', 'curl', true, 20),
      row('b', 'squat', true, 80),
    ])).toEqual([{ userId: 'a', value: 15 }]);
  });
});

describe('getLeaderboardsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(leaderboardRepository.findBestEstimates).mockResolvedValue([]);
    vi.mocked(leaderboardRepository.findNames).mockImplementation(async (userIds) =>
      userIds.map((id) => ({ _id: new Types.ObjectId(id), name: `Member ${id.slice(-4)} Test` })));
  });

  it('shows the top 100 and still gives members outside it their own place', async () => {
    vi.mocked(leaderboardRepository.findHeaviestByUser).mockResolvedValue(ids.map((id, index) => ({ _id: id.toString(), weightKg: 300 - index })));
    const me = ids[104].toString();
    const board = ((await getLeaderboardsService(me)).data as Leaderboards).deadlift;
    expect(board.entries).toHaveLength(100);
    expect(board.total).toBe(105);
    expect(board.me).toMatchObject({ rank: 105, value: 196, isMe: true });
    expect(board.me?.name).toBe('Member T.');
    expect((await getLeaderboardsService(ids[0].toString())).data).toMatchObject({ deadlift: { me: { rank: 1 } }, progress: { me: null, total: 0 } });
  });
});
