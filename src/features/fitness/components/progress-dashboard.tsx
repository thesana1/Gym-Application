'use client';

import { Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { ImageUpload } from '@/features/dashboard/components/image-upload';
import { LiftProgressCard } from '@/features/fitness/components/lift-progress-card';
import { MeasurementWindowSummary } from '@/features/fitness/components/measurement-window-summary';
import { ProgressHeader } from '@/features/fitness/components/progress-header';
import { ProgressMeasurementForm } from '@/features/fitness/components/progress-measurement-form';
import { ProgressMeasurementHistory } from '@/features/fitness/components/progress-measurement-history';
import { formatMeasurementDate } from '@/features/fitness/components/progress-measurement-history';
import { useProgressMeasurements } from '@/features/fitness/hooks/use-progress-measurements';
import type { ProgressMeasurement } from '@/features/fitness/service/progress-measurement.service';
import type {
  ProgressMeasurementInput,
  ProgressMeasurementType,
} from '@/features/fitness/validations/progress-measurement.validation';
import { Button } from '@/shared/components/ui/button';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { PROGRESS_COPY } from '@/shared/const/copy-progress.const';

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

const copy = PROGRESS_COPY.body;

const LatestWeight = ({ measurements }: { measurements: ProgressMeasurement[] }) => {
  const latest = measurements.find(({ weightKg }) => weightKg !== undefined);
  if (!latest) return <EmptyState message={copy.empty} />;
  return (
    <section aria-labelledby="latest-weight" className="rounded-lg border border-border bg-card p-5">
      <h2 id="latest-weight" className="text-base font-medium text-muted-foreground">{copy.latest}</h2>
      <p className="font-heading text-5xl font-extrabold tabular-nums">{latest.weightKg}<span className="ml-1 text-2xl text-muted-foreground">kg</span></p>
      <p className="mt-1 text-base text-muted-foreground">{copy.savedOn(formatMeasurementDate(latest.date))}</p>
    </section>
  );
};

export const ProgressDashboard = () => {
  const { measurements, loading, saving, error, loadMeasurements, saveMeasurement, deleteMeasurement, setError } = useProgressMeasurements();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProgressMeasurement | null>(null);

  const refresh = useCallback(() => {
    void loadMeasurements();
  }, [loadMeasurements]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setError(null);
  };

  const handleSave = async (value: ProgressMeasurementType) => {
    if (await saveMeasurement(editing?.id ?? null, value)) {
      closeForm();
      refresh();
    }
  };

  const handleDelete = async (measurement: ProgressMeasurement) => {
    if (!window.confirm(copy.confirmDelete(formatMeasurementDate(measurement.date)))) return;
    if (await deleteMeasurement(measurement.id)) refresh();
  };

  return (
    <div className="max-w-2xl animate-rise">
      <ProgressHeader />
      <div className="flex flex-col gap-4">
        {error && <p className="text-base text-destructive" role="alert">{error}</p>}
        {formOpen ? (
          <section aria-labelledby="measurement-form" className="rounded-lg border border-border bg-card p-5">
            <h2 id="measurement-form" className="mb-5 text-2xl">{editing ? PROGRESS_COPY.form.editTitle : PROGRESS_COPY.form.addTitle}</h2>
            <ProgressMeasurementForm key={editing?.id ?? 'new-measurement'} saving={saving} onCancel={closeForm} onSave={handleSave}
              initialValues={editing ? toFormValues(editing) : { ...EMPTY_MEASUREMENT, date: getToday() }} />
          </section>
        ) : (
          <>
            <LiftProgressCard />
            {loading
              ? <div className="h-36 animate-pulse rounded-lg bg-muted" role="status" aria-label={copy.loading} />
              : <LatestWeight measurements={measurements} />}
            <Button size="lg" className="sticky bottom-24 z-10 w-full shadow-lg lg:bottom-6"
              onClick={() => { setEditing(null); setFormOpen(true); setError(null); }}>
              <Plus className="size-5" aria-hidden="true" />{copy.add}
            </Button>
            <Disclosure summary={copy.compare}><MeasurementWindowSummary measurements={measurements} /></Disclosure>
            {measurements.length > 0 && (
              <Disclosure summary={copy.all}>
                <ProgressMeasurementHistory measurements={measurements} onDelete={handleDelete}
                  onEdit={(measurement) => { setEditing(measurement); setFormOpen(true); setError(null); }} />
              </Disclosure>
            )}
            <Disclosure summary={copy.photos}><ImageUpload /></Disclosure>
            <p className="text-base text-muted-foreground">{copy.note}</p>
          </>
        )}
      </div>
    </div>
  );
};
