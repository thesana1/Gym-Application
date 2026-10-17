'use client';

import { useCallback, useEffect, useState } from 'react';

import { MeasurementWindowSummary } from '@/features/fitness/components/measurement-window-summary';
import { ProgressMeasurementForm } from '@/features/fitness/components/progress-measurement-form';
import { ProgressMeasurementHistory } from '@/features/fitness/components/progress-measurement-history';
import { useProgressMeasurements } from '@/features/fitness/hooks/use-progress-measurements';
import type { ProgressMeasurement } from '@/features/fitness/service/progress-measurement.service';
import type {
  ProgressMeasurementInput,
  ProgressMeasurementType,
} from '@/features/fitness/validations/progress-measurement.validation';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

const getToday = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
};

const EMPTY_MEASUREMENT: ProgressMeasurementInput = {
  date: getToday(),
  weightKg: '',
  waistCm: '',
  hipsCm: '',
  chestCm: '',
  armCm: '',
  thighCm: '',
  notes: '',
};

const toFormValues = (
  measurement: ProgressMeasurement
): ProgressMeasurementInput => ({
  date: measurement.date,
  weightKg: measurement.weightKg === undefined ? '' : String(measurement.weightKg),
  waistCm: measurement.waistCm === undefined ? '' : String(measurement.waistCm),
  hipsCm: measurement.hipsCm === undefined ? '' : String(measurement.hipsCm),
  chestCm: measurement.chestCm === undefined ? '' : String(measurement.chestCm),
  armCm: measurement.armCm === undefined ? '' : String(measurement.armCm),
  thighCm: measurement.thighCm === undefined ? '' : String(measurement.thighCm),
  notes: measurement.notes ?? '',
});

export const ProgressDashboard = () => {
  const {
    measurements,
    loading,
    saving,
    error,
    loadMeasurements,
    saveMeasurement,
    deleteMeasurement,
    setError,
  } = useProgressMeasurements();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProgressMeasurement | null>(null);

  const refresh = useCallback(() => {
    void loadMeasurements();
  }, [loadMeasurements]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSave = async (value: ProgressMeasurementType) => {
    if (await saveMeasurement(editing?.id ?? null, value)) {
      setFormOpen(false);
      setEditing(null);
      refresh();
    }
  };

  const handleDelete = async (measurement: ProgressMeasurement) => {
    if (
      !window.confirm(
        `Delete the measurement record from ${measurement.date}?`
      )
    ) {
      return;
    }
    if (await deleteMeasurement(measurement.id)) refresh();
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your progress
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Measurements</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          See changes across your own records. Tracking is optional and
          measurements are not medical assessments.
        </p>
      </header>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-base">
            {editing ? 'Edit measurement record' : 'Record measurements'}
          </CardTitle>
          {!formOpen && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
                setError(null);
              }}
            >
              Add record
            </Button>
          )}
        </CardHeader>
        {formOpen && (
          <CardContent>
            <ProgressMeasurementForm
              key={editing?.id ?? 'new-measurement'}
              initialValues={editing ? toFormValues(editing) : EMPTY_MEASUREMENT}
              saving={saving}
              onCancel={() => {
                setFormOpen(false);
                setEditing(null);
                setError(null);
              }}
              onSave={handleSave}
            />
          </CardContent>
        )}
      </Card>

      <ProgressMeasurementHistory
        measurements={measurements}
        loading={loading}
        onEdit={(measurement) => {
          setEditing(measurement);
          setFormOpen(true);
          setError(null);
        }}
        onDelete={handleDelete}
      />
      <MeasurementWindowSummary measurements={measurements} />
    </div>
  );
};
