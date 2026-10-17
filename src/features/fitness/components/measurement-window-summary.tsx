'use client';

import { useMemo, useState } from 'react';

import type { ProgressMeasurement } from '@/features/fitness/service/progress-measurement.service';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

const MEASUREMENTS = [
  { key: 'weightKg', label: 'Weight', unit: 'kg' },
  { key: 'waistCm', label: 'Waist', unit: 'cm' },
  { key: 'hipsCm', label: 'Hips', unit: 'cm' },
  { key: 'chestCm', label: 'Chest', unit: 'cm' },
  { key: 'armCm', label: 'Arm', unit: 'cm' },
  { key: 'thighCm', label: 'Thigh', unit: 'cm' },
] as const;

type MeasurementKey = (typeof MEASUREMENTS)[number]['key'];
type MeasurementComparison = {
  key: MeasurementKey;
  label: string;
  unit: string;
  first: number;
  latest: number;
  firstDate: string;
  latestDate: string;
  change: number;
};

export type MeasurementWindowSummary = {
  startDate: string;
  endDate: string;
  recordCount: number;
  comparisons: MeasurementComparison[];
};

const toLocalDateString = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

export const getMeasurementWindowSummary = (
  measurements: ProgressMeasurement[],
  weeks: 4 | 8,
  now = new Date()
): MeasurementWindowSummary => {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(end);
  start.setDate(start.getDate() - weeks * 7 + 1);
  const startDate = toLocalDateString(start);
  const endDate = toLocalDateString(end);
  const periodMeasurements = measurements
    .filter(
      ({ date }) => date >= startDate && date <= endDate
    )
    .toSorted((left, right) => left.date.localeCompare(right.date));

  const comparisons = MEASUREMENTS.flatMap(
    ({ key, label, unit }): MeasurementComparison[] => {
      const readings = periodMeasurements.flatMap((measurement) => {
        const value = measurement[key];
        return value === undefined ? [] : [{ date: measurement.date, value }];
      });
      if (readings.length < 2) return [];
      const first = readings[0];
      const latest = readings[readings.length - 1];
      return [
        {
          key,
          label,
          unit,
          first: first.value,
          latest: latest.value,
          firstDate: first.date,
          latestDate: latest.date,
          change: latest.value - first.value,
        },
      ];
    }
  );

  return {
    startDate,
    endDate,
    recordCount: periodMeasurements.length,
    comparisons,
  };
};

const formatChange = (change: number) =>
  `${change > 0 ? '+' : ''}${change.toFixed(1)}`;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
    new Date(`${date}T12:00:00`)
  );

type MeasurementWindowSummaryProps = {
  measurements: ProgressMeasurement[];
};

export const MeasurementWindowSummary = ({
  measurements,
}: MeasurementWindowSummaryProps) => {
  const [weeks, setWeeks] = useState<4 | 8>(4);
  const summary = useMemo(
    () => getMeasurementWindowSummary(measurements, weeks),
    [measurements, weeks]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent measurement comparison</CardTitle>
        <CardDescription>
          Compare the earliest and latest self-entered values for each
          measurement type. Changes are descriptive only, not an assessment of
          progress or health.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2" aria-label="Comparison period">
          <Button
            variant={weeks === 4 ? 'default' : 'outline'}
            aria-pressed={weeks === 4}
            onClick={() => setWeeks(4)}
          >
            4 weeks
          </Button>
          <Button
            variant={weeks === 8 ? 'default' : 'outline'}
            aria-pressed={weeks === 8}
            onClick={() => setWeeks(8)}
          >
            8 weeks
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDate(summary.startDate)} – {formatDate(summary.endDate)} ·{' '}
          {summary.recordCount} record{summary.recordCount === 1 ? '' : 's'} in
          this window
        </p>
        {summary.recordCount === 0 ? (
          <p className="text-sm text-muted-foreground">
            No measurements were recorded in this period.
          </p>
        ) : summary.comparisons.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            At least two dated values of the same measurement type are needed
            for a comparison.
          </p>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summary.comparisons.map((comparison) => (
              <div
                key={comparison.key}
                className="rounded-md border border-border p-4"
              >
                <dt className="text-sm font-medium">{comparison.label}</dt>
                <dd className="mt-2 text-lg font-semibold">
                  {formatChange(comparison.change)} {comparison.unit}
                </dd>
                <dd className="mt-1 text-xs text-muted-foreground">
                  {comparison.first} {comparison.unit} on{' '}
                  {formatDate(comparison.firstDate)}
                </dd>
                <dd className="text-xs text-muted-foreground">
                  {comparison.latest} {comparison.unit} on{' '}
                  {formatDate(comparison.latestDate)}
                </dd>
              </div>
            ))}
          </dl>
        )}
        <p className="text-xs text-muted-foreground">
          Only measurements you entered are shown. The app does not infer
          missing values or recommend a target direction.
        </p>
      </CardContent>
    </Card>
  );
};
