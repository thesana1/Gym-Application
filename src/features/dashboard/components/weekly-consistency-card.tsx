import { Check, Dumbbell, UtensilsCrossed } from 'lucide-react';

import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import type { NutritionEntry } from '@/features/nutrition/service/nutrition.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export type WeeklyConsistencyDay = {
  key: string;
  label: string;
  workout: boolean;
  nutrition: boolean;
};

export type WeeklyConsistencySummary = {
  workoutDays: number;
  nutritionDays: number;
  overlapDays: number;
  days: WeeklyConsistencyDay[];
};

export const getLocalDateKey = (value: Date | string) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const summarizeWeeklyConsistency = ({
  workouts,
  entries,
  now = new Date(),
}: {
  workouts: WorkoutLog[];
  entries: NutritionEntry[];
  now?: Date;
}): WeeklyConsistencySummary => {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  const workoutDates = new Set(
    workouts.map((workout) => getLocalDateKey(workout.completedAt))
  );
  const nutritionDates = new Set(entries.map((entry) => entry.date));

  const days: WeeklyConsistencyDay[] = Array.from({ length: 7 }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);

    const key = getLocalDateKey(current);

    return {
      key,
      label: current.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3),
      workout: workoutDates.has(key),
      nutrition: nutritionDates.has(key),
    };
  });

  const workoutDays = days.filter((day) => day.workout).length;
  const nutritionDays = days.filter((day) => day.nutrition).length;
  const overlapDays = days.filter((day) => day.workout && day.nutrition).length;

  return {
    workoutDays,
    nutritionDays,
    overlapDays,
    days,
  };
};

type WeeklyConsistencyCardProps = {
  workouts: WorkoutLog[];
  entries: NutritionEntry[];
  now?: Date;
};

export const WeeklyConsistencyCard = ({
  workouts,
  entries,
  now = new Date(),
}: WeeklyConsistencyCardProps) => {
  const summary = summarizeWeeklyConsistency({ workouts, entries, now });

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Check className="size-4 text-primary" />
          7-day momentum
        </CardTitle>
        <CardDescription>
          Your last seven local days of consistency from logged workouts and meals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Workouts</p>
            <p className="mt-2 text-lg font-semibold">{summary.workoutDays}/7 days</p>
          </div>
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Nutrition logs</p>
            <p className="mt-2 text-lg font-semibold">{summary.nutritionDays}/7 days</p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {summary.days.map((day) => {
            const isActive = day.workout || day.nutrition;
            const isStrong = day.workout && day.nutrition;

            return (
              <div
                key={day.key}
                className={[
                  'flex flex-col items-center rounded-md border p-2 text-center',
                  isStrong
                    ? 'border-primary bg-primary/10 text-primary'
                    : isActive
                      ? 'border-border bg-muted/40 text-foreground'
                      : 'border-border bg-background text-muted-foreground',
                ].join(' ')}
              >
                <span className="text-xs font-medium uppercase tracking-wide">
                  {day.label}
                </span>
                <span className="mt-2 inline-flex size-6 items-center justify-center rounded-full border border-current text-xs font-semibold">
                  {day.workout ? <Dumbbell className="size-3" /> : day.nutrition ? <UtensilsCrossed className="size-3" /> : '·'}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          {summary.overlapDays} {summary.overlapDays === 1 ? 'day included' : 'days included'} both a logged workout and a food/water entry.
        </p>
      </CardContent>
    </Card>
  );
};
