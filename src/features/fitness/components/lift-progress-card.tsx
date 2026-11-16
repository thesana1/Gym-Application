'use client';

import { TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { LiftProgressChart } from '@/features/fitness/components/lift-progress-chart';
import { useWorkoutLogs } from '@/features/fitness/hooks/use-workout-logs';
import { buildLiftProgress, type LiftProgress } from '@/features/fitness/service/lift-progress.service';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { PROGRESS_COPY } from '@/shared/const/copy-progress.const';
import { cn } from '@/shared/lib/utils';

const copy = PROGRESS_COPY.strength;
const HISTORY_DAYS = 365;

const cheer = (lift: LiftProgress) => {
  if (lift.points.length === 1) return copy.firstOne;
  if (lift.gain > 0 && lift.latest === lift.best) return copy.newBest;
  return lift.gain > 0 ? copy.climbing : copy.steady;
};

const LiftSummary = ({ lift }: { lift: LiftProgress }) => (
  <div className="flex flex-col gap-1">
    <p className="text-base font-medium text-muted-foreground">{lift.exerciseName}</p>
    {lift.gain > 0 ? (
      <p className="flex items-center gap-2 font-heading text-4xl font-semibold tabular-nums text-primary">
        <TrendingUp className="size-8 animate-pop" aria-hidden="true" />{copy.gain(lift.gain, lift.unit)}
      </p>
    ) : (
      <p className="font-heading text-4xl font-semibold tabular-nums">{lift.best} {lift.unit}</p>
    )}
    {lift.gain > 0 && <p className="text-base font-semibold">{copy.stronger(lift.gainPercent, lift.points.length)}</p>}
    <p className="text-base text-muted-foreground">{cheer(lift)}</p>
  </div>
);

export const LiftProgressCard = () => {
  const { workouts, loading, error, loadWorkouts } = useWorkoutLogs();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const lifts = useMemo(() => buildLiftProgress(workouts), [workouts]);
  const lift = lifts.find(({ exerciseId }) => exerciseId === selectedId) ?? lifts[0];

  useEffect(() => {
    void loadWorkouts({ from: new Date(Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000).toISOString() });
  }, [loadWorkouts]);

  if (loading) return <div className="h-72 animate-pulse rounded-2xl bg-muted" role="status" aria-label={copy.loading} />;
  if (error) return <p className="text-base text-destructive" role="alert">{copy.error}</p>;

  return (
    <section aria-labelledby="strength-title" className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <h2 id="strength-title" className="text-2xl font-semibold">{copy.title}</h2>
      {!lift ? <EmptyState message={copy.empty} /> : (
        <>
          <LiftSummary lift={lift} />
          <LiftProgressChart key={lift.exerciseId} lift={lift} />
          <div className="flex flex-wrap justify-between gap-2 text-base tabular-nums text-muted-foreground">
            <span>{copy.first(lift.first, lift.unit)}</span>
            <span className="font-semibold text-foreground">{copy.best(lift.best, lift.unit)}</span>
          </div>
          {lifts.length > 1 && (
            <div role="group" aria-label={copy.pickLabel} className="flex flex-wrap gap-2">
              {lifts.map((option) => (
                <button key={option.exerciseId} type="button" aria-pressed={option.exerciseId === lift.exerciseId}
                  onClick={() => setSelectedId(option.exerciseId)}
                  className={cn('flex min-h-11 items-center gap-2 rounded-full border px-4 text-base font-medium',
                    'focus-visible:outline-2 focus-visible:outline-ring',
                    option.exerciseId === lift.exerciseId ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent')}>
                  {option.exerciseName}
                  {option.gain > 0 && <span className="text-sm font-semibold text-primary">{copy.gain(option.gain, option.unit)}</span>}
                </button>
              ))}
            </div>
          )}
          <p className="text-base text-muted-foreground">{copy.note[lift.unit]}</p>
        </>
      )}
    </section>
  );
};
