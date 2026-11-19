import { type BestEstimateRow, leaderboardRepository } from '@/features/leaderboard/repository/leaderboard.repository';
import type { Leaderboard, Leaderboards, LeaderboardScore } from '@/features/leaderboard/types/leaderboard.types';
import { DEADLIFT_EXERCISE_IDS, LEADERBOARD_LIMITS } from '@/shared/const/leaderboard.const';
import type { ServiceResult } from '@/shared/types/common';

const DAY_MS = 86400000;

// "Giorgi Sanadiradze" becomes "Giorgi S." so members are recognisable without full names.
export const shortName = (name: string) => {
  const [first = '', ...rest] = name.trim().split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
};

type RankedScore = LeaderboardScore & { rank: number };

// Highest first; equal scores share a place (1, 2, 2, 4).
export const rankScores = (scores: LeaderboardScore[]): RankedScore[] => {
  const sorted = [...scores].sort((a, b) => b.value - a.value);
  let rank = 0;
  return sorted.map((score, index) => {
    if (index === 0 || sorted[index - 1].value !== score.value) rank = index + 1;
    return { ...score, rank };
  });
};

// Average % gain across lifts done both in the last 30 days and before them.
export const progressScores = (rows: BestEstimateRow[]): LeaderboardScore[] => {
  const lifts = new Map<string, Map<string, { before?: number; recent?: number }>>();
  for (const { _id, best } of rows) {
    const byLift = lifts.get(_id.userId) ?? new Map<string, { before?: number; recent?: number }>();
    byLift.set(_id.exerciseId, { ...byLift.get(_id.exerciseId), [_id.recent ? 'recent' : 'before']: best });
    lifts.set(_id.userId, byLift);
  }
  return [...lifts].flatMap(([userId, byLift]) => {
    const gains = [...byLift.values()].flatMap(({ before, recent }) => (before && recent ? [(recent - before) / before] : []));
    if (gains.length === 0) return [];
    const average = gains.reduce((sum, gain) => sum + gain, 0) / gains.length;
    return [{ userId, value: Math.round(average * 1000) / 10 }];
  });
};

const buildBoard = (ranked: RankedScore[], userId: string, names: Map<string, string>): Leaderboard => {
  const toEntry = (score: RankedScore) => ({
    rank: score.rank, name: names.get(score.userId) ?? '', value: score.value, isMe: score.userId === userId,
  });
  const mine = ranked.find((score) => score.userId === userId);
  return {
    entries: ranked.slice(0, LEADERBOARD_LIMITS.topSize).map(toEntry),
    me: mine ? toEntry(mine) : null,
    total: ranked.length,
  };
};

export async function getLeaderboardsService(userId: string): Promise<ServiceResult<Leaderboards>> {
  const since = new Date(Date.now() - LEADERBOARD_LIMITS.progressDays * DAY_MS);
  const [heaviest, estimates] = await Promise.all([
    leaderboardRepository.findHeaviestByUser(DEADLIFT_EXERCISE_IDS),
    leaderboardRepository.findBestEstimates(since),
  ]);
  const deadlift = rankScores(heaviest.map((row) => ({ userId: row._id, value: row.weightKg })));
  const progress = rankScores(progressScores(estimates));

  // Only look up names for rows that are shown.
  const top = (ranked: RankedScore[]) => ranked.slice(0, LEADERBOARD_LIMITS.topSize).map((score) => score.userId);
  const shown = new Set([...top(deadlift), ...top(progress), userId]);
  const users = await leaderboardRepository.findNames([...shown]);
  const names = new Map(users.map((user) => [user._id.toString(), shortName(user.name)]));

  return {
    data: { progress: buildBoard(progress, userId, names), deadlift: buildBoard(deadlift, userId, names) },
    status: 200,
  };
}
