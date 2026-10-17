'use client';

import { useCallback, useEffect, useState } from 'react';

import { RecentMeasurementCard } from '@/features/dashboard/components/recent-measurement-card';
import { TodayNutritionCard } from '@/features/dashboard/components/today-nutrition-card';
import { TodayWorkoutCard } from '@/features/dashboard/components/today-workout-card';
import { WeeklyConsistencyCard } from '@/features/dashboard/components/weekly-consistency-card';
import type { ProgressMeasurement } from '@/features/fitness/service/progress-measurement.service';
import type { TrainingSchedule } from '@/features/fitness/service/training-schedule.service';
import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import type {
  NutritionEntry,
  NutritionTargets,
} from '@/features/nutrition/service/nutrition.service';
import { Card, CardContent } from '@/shared/components/ui/card';
import { http } from '@/shared/lib/http';

type TodayData = {
  workouts: WorkoutLog[];
  entries: NutritionEntry[];
  targets: NutritionTargets | null;
  schedule: TrainingSchedule;
  measurements: ProgressMeasurement[];
};

export const getLocalDayRange = (now = new Date()) => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    date: [
      start.getFullYear(),
      String(start.getMonth() + 1).padStart(2, '0'),
      String(start.getDate()).padStart(2, '0'),
    ].join('-'),
    from: start.toISOString(),
    to: new Date(end.getTime() - 1).toISOString(),
  };
};

export const TodayOverview = () => {
  const [data, setData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadToday = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const day = getLocalDayRange();
      const [workouts, entries, targets, schedule, measurements] = await Promise.all([
        http.get<WorkoutLog[]>('/fitness/workouts', {
          params: { from: day.from, to: day.to },
        }),
        http.get<NutritionEntry[]>('/nutrition/entries', {
          params: { date: day.date },
        }),
        http.get<NutritionTargets | null>('/nutrition/targets'),
        http.get<TrainingSchedule>('/fitness/schedule'),
        http.get<ProgressMeasurement[]>('/fitness/measurements'),
      ]);
      setData({ workouts, entries, targets, schedule, measurements });
    } catch {
      setError('Could not load today’s activity. Please try again.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadToday();
  }, [loadToday]);

  return (
    <section aria-labelledby="today-overview-title" className="animate-rise">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your local day
        </p>
        <h2 id="today-overview-title" className="mt-1 text-lg font-semibold">
          Today
        </h2>
      </div>

      {error && (
        <Card className="mb-4">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <p className="text-sm text-destructive" role="alert">{error}</p>
            <button
              type="button"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => void loadToday()}
            >
              Try again
            </button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground" role="status">
          Loading today’s activity…
        </p>
      ) : data ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <TodayWorkoutCard
              workouts={data.workouts}
              plannedSession={
                data.schedule.assignments.find(
                  ({ weekday }) => weekday === new Date().getDay()
                ) ?? null
              }
            />
            <TodayNutritionCard entries={data.entries} targets={data.targets} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <WeeklyConsistencyCard workouts={data.workouts} entries={data.entries} />
            <RecentMeasurementCard measurements={data.measurements} />
          </div>
        </>
      ) : null}
      <p className="mt-3 text-xs text-muted-foreground">
        Planned sessions come only from the weekdays you assigned. They are
        separate from completed workout logs; nutrition totals and targets are
        self-reported, approximate tracking information, not medical advice.
      </p>
    </section>
  );
};
