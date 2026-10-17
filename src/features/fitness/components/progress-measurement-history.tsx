'use client';

import { Pencil, Trash2 } from 'lucide-react';

import type { ProgressMeasurement } from '@/features/fitness/service/progress-measurement.service';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

type ProgressMeasurementHistoryProps = {
  measurements: ProgressMeasurement[];
  loading: boolean;
  onEdit: (measurement: ProgressMeasurement) => void;
  onDelete: (measurement: ProgressMeasurement) => void;
};

const MEASUREMENT_LABELS = [
  { key: 'weightKg', label: 'Weight', unit: 'kg' },
  { key: 'waistCm', label: 'Waist', unit: 'cm' },
  { key: 'hipsCm', label: 'Hips', unit: 'cm' },
  { key: 'chestCm', label: 'Chest', unit: 'cm' },
  { key: 'armCm', label: 'Arm', unit: 'cm' },
  { key: 'thighCm', label: 'Thigh', unit: 'cm' },
] as const;

type MeasurementKey = (typeof MEASUREMENT_LABELS)[number]['key'];

const getPreviousValue = (
  history: ProgressMeasurement[],
  startIndex: number,
  key: MeasurementKey
) => history.slice(startIndex + 1).find((measurement) => measurement[key] !== undefined)?.[key];

const formatDifference = (current: number, previous: number) => {
  const difference = current - previous;
  const sign = difference > 0 ? '+' : '';
  return `${sign}${difference.toFixed(1)}`;
};

export const ProgressMeasurementHistory = ({
  measurements,
  loading,
  onEdit,
  onDelete,
}: ProgressMeasurementHistoryProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Measurement history</CardTitle>
      <CardDescription>
        {measurements.length
          ? `${measurements.length} records saved. Changes compare user-entered values only.`
          : 'Your saved measurements will appear here.'}
      </CardDescription>
    </CardHeader>
    <CardContent>
      {loading ? (
        <p className="text-sm text-muted-foreground" role="status">
          Loading measurement history...
        </p>
      ) : measurements.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No measurements recorded yet. You can track progress without entering
          any measurements.
        </p>
      ) : (
        <ul className="space-y-4">
          {measurements.map((measurement, index) => (
            <li key={measurement.id} className="rounded-md border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">
                  {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
                    new Date(`${measurement.date}T12:00:00`)
                  )}
                </h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit measurements from ${measurement.date}`}
                    onClick={() => onEdit(measurement)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete measurements from ${measurement.date}`}
                    onClick={() => onDelete(measurement)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {MEASUREMENT_LABELS.map(({ key, label, unit }) => {
                  const value = measurement[key];
                  if (value === undefined) return null;
                  const previous = getPreviousValue(measurements, index, key);

                  return (
                    <div key={key}>
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="mt-1 text-sm font-medium">
                        {value} {unit}
                        {previous !== undefined && (
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            ({formatDifference(value, previous)} {unit})
                          </span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
              {measurement.notes && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {measurement.notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);
