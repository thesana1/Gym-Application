'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { TodayNutritionCard } from '@/features/dashboard/components/today-nutrition-card';
import { TodayWorkoutCard } from '@/features/dashboard/components/today-workout-card';
import type { TrainingSchedule } from '@/features/fitness/service/training-schedule.service';
import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import type { NutritionEntry, NutritionTargets } from '@/features/nutrition/service/nutrition.service';
import { Button } from '@/shared/components/ui/button';
import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { HOME_COPY } from '@/shared/const/copy-home.const';
import { http } from '@/shared/lib/http';

type TodayData = {
  workouts: WorkoutLog[];
  entries: NutritionEntry[];
  targets: NutritionTargets | null;
  schedule: TrainingSchedule;
};

type TodayOverviewProps = { hasProfile: boolean };

export const getLocalDayRange = (now = new Date(), days = 1) => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const from = new Date(start);
  from.setDate(from.getDate() - days + 1);
  return {
    date: [
      start.getFullYear(),
      String(start.getMonth() + 1).padStart(2, '0'),
      String(start.getDate()).padStart(2, '0'),
    ].join('-'),
    from: from.toISOString(),
    to: new Date(end.getTime() - 1).toISOString(),
  };
};

const SetupCard = () => (
  <section aria-labelledby="setup-title" className="rounded-2xl bg-primary p-5 text-primary-foreground">
    <h2 id="setup-title" className="flex items-center gap-2 font-heading text-2xl font-semibold">
      <Sparkles className="size-6" aria-hidden="true" />{HOME_COPY.setup.title}
    </h2>
    <p className="mt-2 text-lg text-primary-foreground/90">{HOME_COPY.setup.body}</p>
    <Button asChild size="lg" variant="secondary" className="mt-6 w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
      <Link href="/dashboard/profile">{HOME_COPY.setup.action}<ArrowRight className="size-5" aria-hidden="true" /></Link>
    </Button>
  </section>
);

const WeekNumber = ({ count }: { count: number }) => (
  <Link href="/dashboard/activity" className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 hover:bg-accent
    focus-visible:outline-2 focus-visible:outline-ring sm:flex-row sm:items-center sm:justify-between">
    <span className="flex flex-col">
      <span className="font-heading text-4xl font-semibold tabular-nums">{count}</span>
      <span className="text-base text-muted-foreground">{HOME_COPY.week.label}</span>
    </span>
    <span className="flex items-center gap-1 text-base font-semibold text-primary">
      {HOME_COPY.week.seeProgress}<ArrowRight className="size-5" aria-hidden="true" />
    </span>
  </Link>
);

export const TodayOverview = ({ hasProfile }: TodayOverviewProps) => {
  const [data, setData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const loadToday = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const day = getLocalDayRange();
      const week = getLocalDayRange(new Date(), 7);
      const [workouts, entries, targets, schedule] = await Promise.all([
        http.get<WorkoutLog[]>('/fitness/workouts', { params: { from: week.from, to: week.to } }),
        http.get<NutritionEntry[]>('/nutrition/entries', { params: { from: day.date, to: day.date } }),
        http.get<NutritionTargets | null>('/nutrition/targets'),
        http.get<TrainingSchedule>('/fitness/schedule'),
      ]);
      setData({ workouts, entries, targets, schedule });
    } catch {
      setError(true);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadToday();
  }, [loadToday]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-label={HOME_COPY.loading}>
        <div className="h-44 animate-pulse rounded-2xl bg-muted" />
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-5" role="alert">
        <p className="text-lg">{HOME_COPY.loadError}</p>
        <Button variant="outline" onClick={() => void loadToday()}>{COMMON_COPY.tryAgain}</Button>
      </div>
    );
  }

  const today = getLocalDayRange();
  const todayWorkouts = data.workouts.filter(({ completedAt }) => completedAt >= today.from && completedAt <= today.to);
  return (
    <div className="flex flex-col gap-4">
      {hasProfile ? <TodayWorkoutCard workouts={todayWorkouts} assignments={data.schedule.assignments} /> : <SetupCard />}
      <TodayNutritionCard entries={data.entries} targets={data.targets} />
      <WeekNumber count={data.workouts.length} />
    </div>
  );
};
