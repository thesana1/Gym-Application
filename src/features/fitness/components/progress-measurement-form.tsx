'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  ProgressMeasurementInput,
  ProgressMeasurementSchema,
  ProgressMeasurementType,
} from '@/features/fitness/validations/progress-measurement.validation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

const MEASUREMENT_FIELDS = [
  { name: 'weightKg', label: 'Weight (kg)', min: '30', max: '350' },
  { name: 'waistCm', label: 'Waist (cm)', min: '20', max: '300' },
  { name: 'hipsCm', label: 'Hips (cm)', min: '20', max: '300' },
  { name: 'chestCm', label: 'Chest (cm)', min: '20', max: '300' },
  { name: 'armCm', label: 'Arm (cm)', min: '10', max: '150' },
  { name: 'thighCm', label: 'Thigh (cm)', min: '20', max: '200' },
] as const;

type ProgressMeasurementFormProps = {
  initialValues: ProgressMeasurementInput;
  saving: boolean;
  onCancel: () => void;
  onSave: (value: ProgressMeasurementType) => Promise<void>;
};

export const ProgressMeasurementForm = ({
  initialValues,
  saving,
  onCancel,
  onSave,
}: ProgressMeasurementFormProps) => {
  const form = useForm<
    ProgressMeasurementInput,
    undefined,
    ProgressMeasurementType
  >({
    resolver: zodResolver(ProgressMeasurementSchema),
    defaultValues: initialValues,
  });

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit(onSave)}
    >
      <label className="grid gap-2 text-sm font-medium">
        Measurement date
        <Input type="date" {...form.register('date')} />
        {form.formState.errors.date && (
          <span className="text-xs text-destructive">
            {form.formState.errors.date.message}
          </span>
        )}
      </label>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MEASUREMENT_FIELDS.map(({ name, label, min, max }) => (
          <label key={name} className="grid gap-2 text-sm font-medium">
            {label} (optional)
            <Input
              type="number"
              min={min}
              max={max}
              step="any"
              {...form.register(name)}
            />
            {form.formState.errors[name]?.message && (
              <span className="text-xs text-destructive">
                {form.formState.errors[name]?.message}
              </span>
            )}
          </label>
        ))}
      </div>

      {form.formState.errors.weightKg && (
        <p className="text-sm text-destructive" role="alert">
          {form.formState.errors.weightKg.message}
        </p>
      )}

      <label className="grid gap-2 text-sm font-medium">
        Notes (optional)
        <textarea
          rows={2}
          maxLength={500}
          {...form.register('notes')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </label>

      <p className="text-xs text-muted-foreground">
        Record only what feels useful. Measurements can vary with technique and
        time of day; they are not a diagnosis or a measure of health.
      </p>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save measurements'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
