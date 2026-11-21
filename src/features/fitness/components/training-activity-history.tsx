'use client';

import { useCallback, useEffect, useState } from 'react';

import { ProgressHeader } from '@/features/fitness/components/progress-header';
import type { TrainingActivity } from '@/features/fitness/service/training-activity.service';
import { Button } from '@/shared/components/ui/button';
import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { PROGRESS_COPY } from '@/shared/const/copy-progress.const';
import { http } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';

const copy = PROGRESS_COPY.activity;
const WEEK_OPTIONS = [4, 8] as const;
const MAX_DOTS = 14;

const formatRange = (start: string, end: string) => {
  const format = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
  return `${format.format(new Date(start))} – ${format.format(new Date(end))}`;
};

export const TrainingActivityHistory = () => {
  const [weeks, setWeeks] = useState<4 | 8>(4);
  const [activity, setActivity] = useState<TrainingActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadActivity = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setActivity(await http.get<TrainingActivity>('/fitness/activity', { params: { weeks } }));
    } catch {
      setActivity(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [weeks]);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity]);

  const periods = activity ? [...activity.periods].reverse() : [];
  return (
    <div className="mx-auto w-full max-w-2xl animate-rise">
      <ProgressHeader />
      <div className="flex flex-col gap-4">
        <div role="group" aria-label={copy.weeksLabel} className="grid grid-cols-2 gap-2">
          {WEEK_OPTIONS.map((option) => (
            <button key={option} type="button" aria-pressed={weeks === option} disabled={loading} onClick={() => setWeeks(option)}
              className={cn('min-h-12 rounded-lg border text-base font-semibold focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60',
                weeks === option ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-accent')}>
              {copy.weeks(option)}
            </button>
          ))}
        </div>

        {error ? (
          <div className="flex flex-col items-start gap-3" role="alert">
            <p className="text-base text-destructive">{copy.error}</p>
            <Button variant="outline" onClick={() => void loadActivity()}>{COMMON_COPY.tryAgain}</Button>
          </div>
        ) : loading ? (
          <div className="h-64 animate-pulse rounded-lg bg-muted" role="status" aria-label={copy.loading} />
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
            {periods.map((period, index) => (
              <li key={period.start} className="flex flex-col gap-2 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h2 className="text-base">{index === 0 ? copy.thisWeek : formatRange(period.start, period.end)}</h2>
                  <p className="text-lg font-semibold tabular-nums">{copy.workouts(period.workoutCount)}</p>
                </div>
                {period.workoutCount > 0 && (
                  <>
                    <div className="flex flex-wrap gap-1" aria-hidden="true">
                      {Array.from({ length: Math.min(period.workoutCount, MAX_DOTS) }, (_, dot) => (
                        <span key={dot} className="h-2.5 w-6 rounded-full bg-primary" />
                      ))}
                    </div>
                    <p className="text-base tabular-nums text-muted-foreground">{copy.details(period.setCount, period.distinctExerciseCount)}</p>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="text-base text-muted-foreground">{copy.note}</p>
      </div>
    </div>
  );
};
