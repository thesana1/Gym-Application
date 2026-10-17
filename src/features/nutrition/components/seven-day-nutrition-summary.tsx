'use client';

import { useCallback, useEffect, useState } from 'react';

import type {
  NutritionEntry,
  NutritionTargets,
} from '@/features/nutrition/service/nutrition.service';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { http } from '@/shared/lib/http';

type DailyNutritionSummary = {
  date: string;
  entryCount: number;
  totals: {
    calories: number;
    proteinGrams: number;
    carbohydrateGrams: number;
    fatGrams: number;
    fiberGrams: number;
    waterMl: number;
  };
};

type SevenDayNutritionSummaryProps = {
  targets: NutritionTargets | null;
};

const toDateString = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

export const getLocalNutritionDateRange = (now = new Date()) => {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  return { from: toDateString(start), to: toDateString(end) };
};

export const summarizeNutritionByLocalDay = (
  entries: NutritionEntry[],
  now = new Date()
): DailyNutritionSummary[] => {
  const { from } = getLocalNutritionDateRange(now);
  const start = new Date(`${from}T12:00:00`);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    const dateKey = toDateString(date);
    const dayEntries = entries.filter((entry) => entry.date === dateKey);
    return {
      date: dateKey,
      entryCount: dayEntries.length,
      totals: dayEntries.reduce(
        (totals, entry) => ({
          calories: totals.calories + entry.calories,
          proteinGrams: totals.proteinGrams + entry.proteinGrams,
          carbohydrateGrams:
            totals.carbohydrateGrams + entry.carbohydrateGrams,
          fatGrams: totals.fatGrams + entry.fatGrams,
          fiberGrams: totals.fiberGrams + entry.fiberGrams,
          waterMl: totals.waterMl + (entry.waterMl ?? 0),
        }),
        {
          calories: 0,
          proteinGrams: 0,
          carbohydrateGrams: 0,
          fatGrams: 0,
          fiberGrams: 0,
          waterMl: 0,
        }
      ),
    };
  });
};

const formatDay = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T12:00:00`));

const METRICS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'proteinGrams', label: 'Protein', unit: 'g' },
  { key: 'carbohydrateGrams', label: 'Carbs', unit: 'g' },
  { key: 'fatGrams', label: 'Fat', unit: 'g' },
  { key: 'fiberGrams', label: 'Fiber', unit: 'g' },
  { key: 'waterMl', label: 'Water', unit: 'ml' },
] as const;

export const SevenDayNutritionSummary = ({
  targets,
}: SevenDayNutritionSummaryProps) => {
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const range = getLocalNutritionDateRange();
      setEntries(
        await http.get<NutritionEntry[]>('/nutrition/entries', {
          params: range,
        })
      );
    } catch {
      setEntries([]);
      setError('Could not load the past seven days of nutrition entries.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const days = summarizeNutritionByLocalDay(entries);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Past seven days</CardTitle>
        <CardDescription>
          Daily totals from your food and water entries, using local calendar
          days. Values are self-entered and may be approximate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {targets && (
          <p className="text-xs text-muted-foreground">
            Your chosen daily reference targets: {targets.calories} kcal,{' '}
            {targets.proteinGrams} g protein, {targets.carbohydrateGrams} g
            carbs, {targets.fatGrams} g fat, {targets.fiberGrams} g fiber, and{' '}
            {targets.waterMl} ml water. These are your entries, not
            recommendations.
          </p>
        )}
        {loading ? (
          <p className="text-sm text-muted-foreground" role="status">
            Loading the past seven days…
          </p>
        ) : error ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-destructive" role="alert">{error}</p>
            <Button variant="outline" onClick={() => void loadEntries()}>
              Try again
            </Button>
          </div>
        ) : (
          <ul className="grid gap-3">
            {days.map(({ date, entryCount, totals }) => (
              <li
                key={date}
                className="rounded-md border border-border p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold">{formatDay(date)}</h3>
                  <p className="text-xs text-muted-foreground">
                    {entryCount
                      ? `${entryCount} entr${entryCount === 1 ? 'y' : 'ies'} logged`
                      : 'No entries logged'}
                  </p>
                </div>
                {entryCount > 0 && (
                  <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {METRICS.map(({ key, label, unit }) => (
                      <div key={key}>
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="mt-1 text-sm font-medium">
                          {totals[key]} {unit}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">
          Days without entries are unlogged, not zero intake. This history does
          not assess nutritional adequacy or provide health recommendations.
        </p>
      </CardContent>
    </Card>
  );
};
