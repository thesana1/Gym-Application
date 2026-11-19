'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { TodayNutritionCard } from '@/features/dashboard/components/today-nutrition-card';
import { TodayWorkoutCard } from '@/features/dashboard/components/today-workout-card';
import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import type { NutritionEntry, NutritionTargets } from '@/features/nutrition/service/nutrition.service';
import type { TrainingPlan } from '@/features/training/service/training-plan.service';
import { Button } from '@/shared/components/ui/button';
import { FIELD_BUTTON } from '@/shared/components/ui/field';
import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { HOME_COPY } from '@/shared/const/copy-home.const';
import { http } from '@/shared/lib/http';

type TodayData = {
  workouts: WorkoutLog[];
  entries: NutritionEntry[];
  targets: NutritionTargets | null;
  plan: TrainingPlan | null;
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
  <section aria-labelledby="setup-title" className="flex flex-col gap-5 rounded-3xl bg-primary p-6 text-primary-foreground">
    <h2 id="setup-title" className="text-4xl leading-none">{HOME_COPY.setup.title}</h2>
    <p className="text-lg">{HOME_COPY.setup.body}</p>
    <Button asChild size="lg" className={FIELD_BUTTON}>
      <Link href="/dashboard/profile">{HOME_COPY.setup.action}<ArrowRight className="size-5" aria-hidden="true" /></Link>
    </Button>
  </section>
);

const WeekNumber = ({ count }: { count: number }) => (
  <Link href="/dashboard/activity" className="group flex items-center justify-between gap-3 rounded-lg px-1 py-2
    transition-transform duration-150 active:scale-98 focus-visible:outline-2 focus-visible:outline-ring">
    <span className="flex items-baseline gap-3">
      <span className="font-heading text-5xl font-extrabold tracking-display text-pool">{count}</span>
      <span className="text-base font-medium text-muted-foreground">{HOME_COPY.week.label}</span>
    </span>
    <span className="flex items-center gap-1 text-base font-bold">
      <span className="hidden whitespace-nowrap sm:inline">{HOME_COPY.week.seeProgress}</span>
      <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
    </span>
  </Link>
);

const STREAK_DAYS = 91;

export const TodayOverview = ({ hasProfile }: TodayOverviewProps) => {
  const [data, setData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const loadToday = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const day = getLocalDayRange();
      // 13 weeks back so the plan's streak can be counted; the 7-day number filters this down.
      const week = getLocalDayRange(new Date(), STREAK_DAYS);
      const [workouts, entries, targets, plan] = await Promise.all([
        http.get<WorkoutLog[]>('/fitness/workouts', { params: { from: week.from, to: week.to } }),
        http.get<NutritionEntry[]>('/nutrition/entries', { params: { from: day.date, to: day.date } }),
        http.get<NutritionTargets | null>('/nutrition/targets'),
        http.get<TrainingPlan | null>('/training/plan'),
      ]);
      setData({ workouts, entries, targets, plan });
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
        <div className="h-72 animate-pulse rounded-3xl bg-primary/40" />
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg bg-muted p-5" role="alert">
        <p className="text-lg">{HOME_COPY.loadError}</p>
        <Button variant="outline" onClick={() => void loadToday()}>{COMMON_COPY.tryAgain}</Button>
      </div>
    );
  }

  const lastSevenDays = getLocalDayRange(new Date(), 7).from;
  return (
    <div className="grid gap-4 lg:grid-cols-5 lg:items-start">
      <div className="lg:col-span-3">
        {hasProfile ? <TodayWorkoutCard plan={data.plan} workouts={data.workouts} /> : <SetupCard />}
      </div>
      <div className="flex flex-col gap-4 lg:col-span-2">
        <TodayNutritionCard entries={data.entries} targets={data.targets} />
        <WeekNumber count={data.workouts.filter(({ completedAt }) => completedAt >= lastSevenDays).length} />
      </div>
    </div>
  );
};
