import { Activity } from 'lucide-react';

import type { ProgressMeasurement } from '@/features/fitness/service/progress-measurement.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

const MEASUREMENT_META = [
  { key: 'weightKg', label: 'Weight', unit: 'kg' },
  { key: 'waistCm', label: 'Waist', unit: 'cm' },
  { key: 'hipsCm', label: 'Hips', unit: 'cm' },
] as const;

type MeasurementMetricKey = (typeof MEASUREMENT_META)[number]['key'];

type RecentMeasurementSummary = {
  key: MeasurementMetricKey;
  label: string;
  unit: string;
  firstValue: number;
  latestValue: number;
  change: number;
  firstDate: string;
  latestDate: string;
};

const toLocalDateString = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

export const summarizeRecentMeasurements = (
  measurements: ProgressMeasurement[],
  now = new Date()
) => {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(end);
  start.setDate(start.getDate() - 27);

  const startDate = toLocalDateString(start);
  const endDate = toLocalDateString(end);

  const inWindow = measurements
    .filter(({ date }) => date >= startDate && date <= endDate)
    .toSorted((left, right) => left.date.localeCompare(right.date));

  const metrics: RecentMeasurementSummary[] = MEASUREMENT_META.flatMap(
    ({ key, label, unit }) => {
      const reads = inWindow.flatMap((measurement) => {
        const value = measurement[key];
        return value === undefined ? [] : [{ date: measurement.date, value }];
      });

      if (reads.length < 2) return [];
      const first = reads[0];
      const latest = reads[reads.length - 1];
      return [
        {
          key,
          label,
          unit,
          firstValue: first.value,
          latestValue: latest.value,
          change: latest.value - first.value,
          firstDate: first.date,
          latestDate: latest.date,
        },
      ];
    }
  );

  return {
    startDate,
    endDate,
    metrics,
  };
};

const formatChange = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}`;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
    new Date(`${date}T12:00:00`)
  );

type RecentMeasurementCardProps = {
  measurements: ProgressMeasurement[];
};

export const RecentMeasurementCard = ({
  measurements,
}: RecentMeasurementCardProps) => {
  const summary = summarizeRecentMeasurements(measurements);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="size-4 text-primary" />
          Recent measurement trend
        </CardTitle>
        <CardDescription>
          Change over the last 4 weeks from your own recorded values.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {summary.metrics.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Log at least two measurements in the last four weeks to see a trend.
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              {formatDate(summary.startDate)} – {formatDate(summary.endDate)}
            </p>
            <dl className="grid gap-3 sm:grid-cols-3">
              {summary.metrics.map((metric) => (
                <div key={metric.key} className="rounded-md border p-3">
                  <dt className="text-xs text-muted-foreground">{metric.label}</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {formatChange(metric.change)} {metric.unit}
                  </dd>
                  <dd className="mt-1 text-[11px] text-muted-foreground">
                    {metric.firstValue} {metric.unit} on {formatDate(metric.firstDate)}
                  </dd>
                  <dd className="text-[11px] text-muted-foreground">
                    {metric.latestValue} {metric.unit} on {formatDate(metric.latestDate)}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </CardContent>
    </Card>
  );
};
