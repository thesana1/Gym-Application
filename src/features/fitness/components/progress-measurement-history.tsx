'use client';

import { Pencil, Trash2 } from 'lucide-react';

import type { ProgressMeasurement } from '@/features/fitness/service/progress-measurement.service';
import { Button } from '@/shared/components/ui/button';
import { MEASUREMENT_KEYS, PROGRESS_COPY } from '@/shared/const/copy-progress.const';

type ProgressMeasurementHistoryProps = {
  measurements: ProgressMeasurement[];
  onEdit: (measurement: ProgressMeasurement) => void;
  onDelete: (measurement: ProgressMeasurement) => void;
};

export const formatMeasurementDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(`${date}T12:00:00`));

const copy = PROGRESS_COPY.history;

export const ProgressMeasurementHistory = ({ measurements, onEdit, onDelete }: ProgressMeasurementHistoryProps) => (
  <ul className="flex flex-col divide-y divide-border">
    {measurements.map((measurement) => {
      const date = formatMeasurementDate(measurement.date);
      return (
        <li key={measurement.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
          <h3 className="text-lg">{date}</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            {MEASUREMENT_KEYS.map((key) => {
              const value = measurement[key];
              if (value === undefined) return null;
              const field = PROGRESS_COPY.fields[key];
              return (
                <div key={key} className="flex flex-col">
                  <dt className="text-base text-muted-foreground">{field.label}</dt>
                  <dd className="text-lg font-semibold tabular-nums">{value} {field.unit}</dd>
                </div>
              );
            })}
          </dl>
          {measurement.notes && <p className="text-base text-muted-foreground">{measurement.notes}</p>}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" aria-label={copy.editLabel(date)} onClick={() => onEdit(measurement)}>
              <Pencil className="size-4" aria-hidden="true" />{copy.edit}
            </Button>
            <Button variant="ghost" size="sm" aria-label={copy.deleteLabel(date)} onClick={() => onDelete(measurement)}
              className="text-destructive hover:text-destructive">
              <Trash2 className="size-4" aria-hidden="true" />{copy.delete}
            </Button>
          </div>
        </li>
      );
    })}
  </ul>
);
