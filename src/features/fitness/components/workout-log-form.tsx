'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';

import { WorkoutLogSetFields } from '@/features/fitness/components/workout-log-set-fields';
import {
  WorkoutLogInput,
  WorkoutLogSchema,
  WorkoutLogType,
} from '@/features/fitness/validations/workout-log.validation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';

type WorkoutLogFormProps = {
  initialValues: WorkoutLogInput;
  saving: boolean;
  onCancel?: () => void;
  onSubmit: (value: WorkoutLogType) => Promise<void>;
};

export const WorkoutLogForm = ({
  initialValues,
  saving,
  onCancel,
  onSubmit,
}: WorkoutLogFormProps) => {
  const form = useForm<WorkoutLogInput, undefined, WorkoutLogType>({
    resolver: zodResolver(WorkoutLogSchema),
    defaultValues: initialValues,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'exercises',
  });

  const submit = async (value: WorkoutLogType) => {
    await onSubmit({
      ...value,
      completedAt: value.completedAt
        ? new Date(value.completedAt).toISOString()
        : undefined,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-5">
      <label className="grid gap-2 text-sm font-medium">
        Workout name
        <Input maxLength={80} {...form.register('title')} />
        {form.formState.errors.title && (
          <span className="text-xs text-destructive">
            {form.formState.errors.title.message}
          </span>
        )}
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Completed at (optional)
        <Input type="datetime-local" {...form.register('completedAt')} />
        <span className="text-xs font-normal text-muted-foreground">
          Leave blank to use the current time.
        </span>
      </label>

      <div className="space-y-4">
        {fields.map((exercise, exerciseIndex) => (
          <div key={exercise.id} className="space-y-3 rounded-lg bg-muted/40 p-3">
            <label className="grid gap-2 text-sm font-medium">
              Exercise
              <select
                {...form.register(`exercises.${exerciseIndex}.exerciseId` as const)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {WORKOUT_EXERCISE_LIBRARY.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              {form.formState.errors.exercises?.[exerciseIndex]?.exerciseId && (
                <span className="text-xs text-destructive">
                  {form.formState.errors.exercises[exerciseIndex]?.exerciseId?.message}
                </span>
              )}
            </label>
            <WorkoutLogSetFields
              control={form.control}
              exerciseIndex={exerciseIndex}
              register={form.register}
              removeExercise={() => remove(exerciseIndex)}
            />
          </div>
        ))}
      </div>

      {form.formState.errors.exercises?.message && (
        <p className="text-sm text-destructive" role="alert">
          {form.formState.errors.exercises.message}
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        disabled={fields.length >= 20}
        onClick={() =>
          append({
            exerciseId: WORKOUT_EXERCISE_LIBRARY[0]?.id ?? '',
            sets: [{ repetitions: '10', weightKg: '' }],
          })
        }
      >
        <Plus className="size-4" />
        Add exercise
      </Button>

      <label className="grid gap-2 text-sm font-medium">
        Notes (optional)
        <textarea
          {...form.register('notes')}
          maxLength={1000}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving workout...' : 'Save workout'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
