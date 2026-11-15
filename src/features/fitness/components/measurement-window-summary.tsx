'use client';

import { useMemo, useState } from 'react';

import type { ProgressMeasurement } from '@/features/fitness/service/progress-measurement.service';
import { MEASUREMENT_KEYS, PROGRESS_COPY, type MeasurementKey } from '@/shared/const/copy-progress.const';
import { cn } from '@/shared/lib/utils';

const MEASUREMENTS = MEASUREMENT_KEYS.map((key) => ({ key, ...PROGRESS_COPY.fields[key] }));
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

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`));

type MeasurementWindowSummaryProps = { measurements: ProgressMeasurement[] };

const copy = PROGRESS_COPY.compare;
const WEEK_OPTIONS = [4, 8] as const;

export const MeasurementWindowSummary = ({ measurements }: MeasurementWindowSummaryProps) => {
  const [weeks, setWeeks] = useState<4 | 8>(4);
  const summary = useMemo(() => getMeasurementWindowSummary(measurements, weeks), [measurements, weeks]);

  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-label={copy.periodLabel} className="grid grid-cols-2 gap-2">
        {WEEK_OPTIONS.map((option) => (
          <button key={option} type="button" aria-pressed={weeks === option} onClick={() => setWeeks(option)}
            className={cn('min-h-12 rounded-lg border text-base font-semibold focus-visible:outline-2 focus-visible:outline-ring',
              weeks === option ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-accent')}>
            {copy.weeks(option)}
          </button>
        ))}
      </div>
      <p className="text-base text-muted-foreground">
        {copy.range(formatDate(summary.startDate), formatDate(summary.endDate), summary.recordCount)}
      </p>
      {summary.recordCount === 0 ? (
        <p className="text-base">{copy.none}</p>
      ) : summary.comparisons.length === 0 ? (
        <p className="text-base">{copy.needTwo}</p>
      ) : (
        <dl className="flex flex-col divide-y divide-border">
          {summary.comparisons.map((comparison) => (
            <div key={comparison.key} className="flex flex-wrap items-baseline justify-between gap-x-3 py-3 first:pt-0">
              <dt className="text-base font-semibold">{comparison.label}</dt>
              <dd className="text-lg font-semibold tabular-nums">{copy.change(comparison.change, comparison.unit)}</dd>
              <dd className="w-full text-base tabular-nums text-muted-foreground">
                {copy.fromTo(comparison.first, comparison.latest, comparison.unit)}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <p className="text-base text-muted-foreground">{copy.note}</p>
    </div>
  );
};
