'use client';

import { useCallback, useEffect, useState } from 'react';

import type { NutritionEntry } from '@/features/nutrition/service/nutrition.service';
import { Button } from '@/shared/components/ui/button';
import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { FOOD_COPY } from '@/shared/const/copy-food.const';
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

type SevenDayNutritionSummaryProps = { refreshKey?: number };

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
  new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`));

const copy = FOOD_COPY.week;

export const SevenDayNutritionSummary = ({ refreshKey = 0 }: SevenDayNutritionSummaryProps) => {
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setEntries(await http.get<NutritionEntry[]>('/nutrition/entries', { params: getLocalNutritionDateRange() }));
    } catch {
      setEntries([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries, refreshKey]);

  if (loading) return <p className="text-base text-muted-foreground" role="status">{copy.loading}</p>;
  if (error) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-base text-destructive" role="alert">{copy.error}</p>
        <Button variant="outline" onClick={() => void loadEntries()}>{COMMON_COPY.tryAgain}</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y divide-border">
        {summarizeNutritionByLocalDay(entries).reverse().map(({ date, entryCount, totals }) => (
          <li key={date} className="flex flex-wrap items-baseline justify-between gap-x-3 py-3 first:pt-0">
            <span className="text-base font-semibold">{formatDay(date)}</span>
            <span className="text-base tabular-nums text-muted-foreground">
              {entryCount ? copy.day(totals.calories, entryCount) : copy.nothing}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-base text-muted-foreground">{copy.note}</p>
    </div>
  );
};
