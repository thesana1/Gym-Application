import { useCallback, useEffect, useState } from 'react';

import type { Leaderboards } from '@/features/leaderboard/types/leaderboard.types';
import { http } from '@/shared/lib/http';

export const useLeaderboards = () => {
  const [boards, setBoards] = useState<Leaderboards | null>(null);
  const [error, setError] = useState(false);

  const fetchBoards = useCallback(() => http.get<Leaderboards>('/leaderboard').then(setBoards, () => setError(true)), []);

  useEffect(() => {
    void fetchBoards();
  }, [fetchBoards]);

  const reload = () => {
    setError(false);
    void fetchBoards();
  };

  return { boards, error, reload };
};
