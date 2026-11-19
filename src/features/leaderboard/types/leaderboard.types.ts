export type LeaderboardEntry = { rank: number; name: string; value: number; isMe: boolean };

export type Leaderboard = {
  entries: LeaderboardEntry[];
  // The member's own row, even when they are outside the top list; null until they have a score.
  me: LeaderboardEntry | null;
  total: number;
};

export type Leaderboards = { progress: Leaderboard; deadlift: Leaderboard };

export type LeaderboardScore = { userId: string; value: number };
