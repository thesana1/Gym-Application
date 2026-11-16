'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

import { WorkoutEditor } from '@/features/training/components/workout-editor';
import { availableExercises } from '@/features/training/service/training-library.service';
import { TrainingPlanSchema, type TrainingPlanType } from '@/features/training/validations/training-plan.validation';
import { Button } from '@/shared/components/ui/button';
import { TRAINING_COPY } from '@/shared/const/copy-training.const';
import type { AvailableEquipment, TrainingExperience } from '@/shared/const/fitness.const';
import { TRAINING_LIMITS } from '@/shared/const/training.const';

type PlanEditorProps = {
  draft: TrainingPlanType;
  experience: TrainingExperience;
  equipment: AvailableEquipment[];
  saving: boolean;
  error: string | null;
  onSave: (plan: TrainingPlanType) => void;
  onCancel: () => void;
};

const copy = TRAINING_COPY.editor;

export const PlanEditor = ({ draft, experience, equipment, saving, error, onSave, onCancel }: PlanEditorProps) => {
  const form = useForm<TrainingPlanType>({ resolver: zodResolver(TrainingPlanSchema), defaultValues: draft });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'workouts' });
  const goal = useWatch({ control: form.control, name: 'goal' });
  const options = availableExercises(equipment);
  const rootError = form.formState.errors.workouts?.root?.message ?? form.formState.errors.workouts?.message;

  const addWorkout = () => {
    const usedIds = new Set(form.getValues('workouts').map(({ id }) => id));
    let next = fields.length + 1;
    while (usedIds.has(`w${next}`)) next += 1;
    append({ id: `w${next}`, name: copy.newWorkoutName(fields.length + 1), weekday: null, exercises: [] });
  };

  return (
    <form noValidate onSubmit={form.handleSubmit(onSave)} className="flex flex-col gap-4">
      {fields.map((field, index) => (
        <WorkoutEditor key={field.id} index={index} control={form.control} register={form.register} goal={goal} experience={experience}
          options={options} onRemove={fields.length > 1 ? () => remove(index) : undefined} />
      ))}
      <Button type="button" variant="outline" onClick={addWorkout} disabled={fields.length >= TRAINING_LIMITS.maxWorkouts}>
        <Plus className="size-5" aria-hidden="true" />{copy.addWorkout}
      </Button>
      {rootError && <p role="alert" className="text-base text-destructive">{rootError}</p>}
      {Object.keys(form.formState.errors).length > 0 && !rootError && (
        <p role="alert" className="text-base text-destructive">{TRAINING_COPY.errors.VALIDATION_ERROR}</p>
      )}
      {error && <p role="alert" className="text-base text-destructive">{error}</p>}
      <div className="sticky bottom-24 z-10 flex gap-3 bg-background/95 py-2 lg:bottom-0">
        <Button type="button" size="lg" variant="outline" onClick={onCancel}>{copy.cancel}</Button>
        <Button type="submit" size="lg" className="flex-1" disabled={saving}>{saving ? copy.saving : copy.save}</Button>
      </div>
    </form>
  );
};
