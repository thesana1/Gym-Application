'use client';

import { LeaderboardBoard } from '@/features/leaderboard/components/leaderboard-board';
import { useLeaderboards } from '@/features/leaderboard/hooks/use-leaderboards';
import { PageHeader } from '@/shared/components/layout/page-header';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { LEADERBOARD_COPY } from '@/shared/const/copy-leaderboard.const';

const copy = LEADERBOARD_COPY;

export const LeaderboardPage = () => {
  const { boards, error, reload } = useLeaderboards();

  return (
    <div className="max-w-2xl animate-rise">
      <PageHeader title={copy.title} description={copy.description} />
      {error ? (
        <div className="flex flex-col items-start gap-3" role="alert">
          <p className="text-base text-destructive">{copy.loadError}</p>
          <Button variant="outline" onClick={reload}>{COMMON_COPY.tryAgain}</Button>
        </div>
      ) : !boards ? (
        <div className="h-64 animate-pulse rounded-3xl bg-muted" role="status" aria-label={copy.loading} />
      ) : (
        <Tabs defaultValue="progress">
          <TabsList aria-label={copy.title}>
            <TabsTrigger value="progress">{copy.boards.progress.tab}</TabsTrigger>
            <TabsTrigger value="deadlift">{copy.boards.deadlift.tab}</TabsTrigger>
          </TabsList>
          <TabsContent value="progress"><LeaderboardBoard kind="progress" board={boards.progress} /></TabsContent>
          <TabsContent value="deadlift"><LeaderboardBoard kind="deadlift" board={boards.deadlift} /></TabsContent>
        </Tabs>
      )}
    </div>
  );
};
