'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  ProgressMeasurementInput,
  ProgressMeasurementSchema,
  ProgressMeasurementType,
} from '@/features/fitness/validations/progress-measurement.validation';
import { Button } from '@/shared/components/ui/button';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { Input } from '@/shared/components/ui/input';
import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { MEASUREMENT_KEYS, PROGRESS_COPY } from '@/shared/const/copy-progress.const';

type ProgressMeasurementFormProps = {
  initialValues: ProgressMeasurementInput;
  saving: boolean;
  onCancel: () => void;
  onSave: (value: ProgressMeasurementType) => Promise<void>;
};

const copy = PROGRESS_COPY.form;
const SIZE_KEYS = MEASUREMENT_KEYS.filter((key) => key !== 'weightKg');

export const ProgressMeasurementForm = ({ initialValues, saving, onCancel, onSave }: ProgressMeasurementFormProps) => {
  const form = useForm<ProgressMeasurementInput, undefined, ProgressMeasurementType>({
    resolver: zodResolver(ProgressMeasurementSchema),
    defaultValues: initialValues,
  });
  const { errors } = form.formState;
  const hasSizes = SIZE_KEYS.some((key) => initialValues[key] !== '');

  return (
    <form className="flex flex-col gap-5" noValidate onSubmit={form.handleSubmit(onSave)}>
      <label className="flex flex-col gap-2 text-base font-medium">
        {copy.weight}
        <Input type="text" inputMode="decimal" autoComplete="off" className="h-14 text-2xl font-semibold tabular-nums" {...form.register('weightKg')}
          aria-invalid={Boolean(errors.weightKg)} />
        {errors.weightKg && <span role="alert" className="text-base text-destructive">{errors.weightKg.message}</span>}
      </label>
      <label className="flex flex-col gap-2 text-base font-medium">
        {copy.date}
        <Input type="date" {...form.register('date')} aria-invalid={Boolean(errors.date)} />
        {errors.date && <span role="alert" className="text-base text-destructive">{errors.date.message}</span>}
      </label>
      <Disclosure summary={copy.sizes} defaultOpen={hasSizes || undefined}>
        <div className="grid grid-cols-2 gap-3">
          {SIZE_KEYS.map((key) => (
            <label key={key} className="flex flex-col gap-2 text-base font-medium">
              {PROGRESS_COPY.fields[key].input}
              <Input type="text" inputMode="decimal" autoComplete="off" className="text-lg tabular-nums" {...form.register(key)}
                aria-invalid={Boolean(errors[key])} />
              {errors[key]?.message && <span role="alert" className="text-base text-destructive">{errors[key]?.message}</span>}
            </label>
          ))}
        </div>
      </Disclosure>
      <Disclosure summary={copy.notes} defaultOpen={Boolean(initialValues.notes) || undefined}>
        <label className="flex flex-col gap-2 text-base font-medium">
          {copy.notesLabel}
          <textarea rows={2} maxLength={500} {...form.register('notes')}
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-base font-normal focus-visible:outline-2 focus-visible:outline-ring" />
        </label>
      </Disclosure>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" size="lg" disabled={saving} className="sm:flex-1">{saving ? copy.saving : copy.save}</Button>
        <Button type="button" size="lg" variant="outline" onClick={onCancel}>{COMMON_COPY.cancel}</Button>
      </div>
    </form>
  );
};
