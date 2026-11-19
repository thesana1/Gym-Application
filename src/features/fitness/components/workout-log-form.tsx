'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';

import { WorkoutLogSetFields } from '@/features/fitness/components/workout-log-set-fields';
import { WorkoutLogInput, WorkoutLogFormSchema, WorkoutLogType } from '@/features/fitness/validations/workout-log.validation';
import { Button } from '@/shared/components/ui/button';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { WORKOUTS_COPY } from '@/shared/const/copy-workouts.const';
import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';

type WorkoutLogFormProps = {
  initialValues: WorkoutLogInput;
  saving: boolean;
  onCancel?: () => void;
  onSubmit: (value: WorkoutLogType) => Promise<void>;
};

const copy = WORKOUTS_COPY.log;

export const WorkoutLogForm = ({ initialValues, saving, onCancel, onSubmit }: WorkoutLogFormProps) => {
  const form = useForm<WorkoutLogInput, undefined, WorkoutLogType>({
    resolver: zodResolver(WorkoutLogFormSchema),
    defaultValues: initialValues,
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'exercises' });
  const { errors } = form.formState;

  const submit = async (value: WorkoutLogType) => {
    await onSubmit({ ...value, completedAt: value.completedAt ? new Date(value.completedAt).toISOString() : undefined });
  };

  return (
    <form noValidate onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-5">
      <ul className="flex flex-col gap-4">
        {fields.map((exercise, exerciseIndex) => (
          <li key={exercise.id} className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4">
            <label className="flex flex-col gap-2">
              <span className="text-base font-medium text-muted-foreground">{copy.exercise}</span>
              <Select {...form.register(`exercises.${exerciseIndex}.exerciseId` as const)} className="text-lg font-semibold">
                {WORKOUT_EXERCISE_LIBRARY.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
              </Select>
              {errors.exercises?.[exerciseIndex]?.exerciseId && (
                <span role="alert" className="text-base text-destructive">{errors.exercises[exerciseIndex]?.exerciseId?.message}</span>
              )}
            </label>
            <WorkoutLogSetFields control={form.control} exerciseIndex={exerciseIndex} register={form.register}
              removeExercise={() => remove(exerciseIndex)} />
          </li>
        ))}
      </ul>

      {errors.exercises?.message && <p className="text-base text-destructive" role="alert">{errors.exercises.message}</p>}

      <Button type="button" variant="outline" disabled={fields.length >= 20}
        onClick={() => append({ exerciseId: WORKOUT_EXERCISE_LIBRARY[0]?.id ?? '', sets: [{ repetitions: '', weightKg: '' }] })}>
        <Plus className="size-5" aria-hidden="true" />{copy.addExercise}
      </Button>

      <Disclosure summary={copy.more} defaultOpen={Boolean(initialValues.notes || initialValues.completedAt) || undefined}>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-base font-medium">
            {copy.name}
            <Input maxLength={80} {...form.register('title')} aria-invalid={Boolean(errors.title)} />
            {errors.title && <span role="alert" className="text-base text-destructive">{errors.title.message}</span>}
          </label>
          <label className="flex flex-col gap-2 text-base font-medium">
            {copy.when}
            <Input type="datetime-local" {...form.register('completedAt')} aria-invalid={Boolean(errors.completedAt)} />
            <span className="font-normal text-muted-foreground">{copy.whenHelp}</span>
            {errors.completedAt && <span role="alert" className="text-base text-destructive">{errors.completedAt.message}</span>}
          </label>
          <label className="flex flex-col gap-2 text-base font-medium">
            {copy.notes}
            <textarea {...form.register('notes')} maxLength={1000} rows={3}
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-base font-normal focus-visible:outline-2 focus-visible:outline-ring" />
          </label>
        </div>
      </Disclosure>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" size="lg" disabled={saving} className="sm:flex-1">{saving ? copy.saving : copy.save}</Button>
        {onCancel && <Button type="button" size="lg" variant="outline" onClick={onCancel}>{COMMON_COPY.cancel}</Button>}
      </div>
    </form>
  );
};
