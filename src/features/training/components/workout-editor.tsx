'use client';

import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useState, type ComponentProps } from 'react';
import { useFieldArray, useFormState, useWatch, type Control, type UseFormRegister } from 'react-hook-form';

import { ExercisePicker } from '@/features/training/components/exercise-picker';
import { planExerciseDefaults } from '@/features/training/service/training-library.service';
import type { TrainingPlanType } from '@/features/training/validations/training-plan.validation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { TRAINING_COPY } from '@/shared/const/copy-training.const';
import type { TrainingExperience } from '@/shared/const/fitness.const';
import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';
import type { WorkoutExerciseDefinition } from '@/shared/types/workout';

type WorkoutEditorProps = {
  index: number;
  control: Control<TrainingPlanType>;
  register: UseFormRegister<TrainingPlanType>;
  goal: TrainingPlanType['goal'];
  experience: TrainingExperience;
  options: WorkoutExerciseDefinition[];
  onRemove?: () => void;
};

const copy = TRAINING_COPY.editor;
const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0];
const numberField = { valueAsNumber: true } as const;
const weekdayField = { setValueAs: (value: string | number | null) => (value === '' || value === null ? null : Number(value)) };

const NumberBox = ({ label, ...props }: { label: string } & ComponentProps<typeof Input>) => (
  <label className="flex flex-col gap-1 text-base font-medium">
    {label}
    <Input type="number" inputMode="numeric" className="text-center text-lg tabular-nums" {...props} />
  </label>
);

export const WorkoutEditor = ({ index, control, register, goal, experience, options, onRemove }: WorkoutEditorProps) => {
  const [picking, setPicking] = useState(false);
  const { fields, append, remove, move } = useFieldArray({ control, name: `workouts.${index}.exercises` });
  const { errors } = useFormState({ control, name: `workouts.${index}` });
  const workoutErrors = errors.workouts?.[index];
  const [name, weekday] = useWatch({ control, name: [`workouts.${index}.name`, `workouts.${index}.weekday`] });

  return (
    // Each workout folds away so a long plan stays easy to scan on a phone; errors force it open.
    <details open={index === 0 || Boolean(workoutErrors)} aria-label={copy.newWorkoutName(index + 1)}
      className="group rounded-2xl border border-border bg-card">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 focus-visible:outline-2
        focus-visible:outline-ring">
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-lg font-semibold">{name || copy.newWorkoutName(index + 1)}</span>
          <span className="text-base text-muted-foreground">
            {weekday === null || weekday === undefined ? copy.noDay : TRAINING_COPY.weekdays[weekday]} · {copy.exercisesCount(fields.length)}
          </span>
        </span>
        <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="flex flex-col gap-4 border-t border-border p-4">
        <div className="grid grid-cols-3 gap-3">
          <label className="col-span-2 flex flex-col gap-1 text-base font-medium">
            {copy.workoutName}
            <Input maxLength={40} className="text-lg font-semibold" {...register(`workouts.${index}.name`)} aria-invalid={Boolean(workoutErrors?.name)} />
          </label>
          <label className="flex flex-col gap-1 text-base font-medium">
            {copy.day}
            <Select {...register(`workouts.${index}.weekday`, weekdayField)}>
              <option value="">{copy.noDay}</option>
              {MONDAY_FIRST.map((day) => <option key={day} value={day}>{TRAINING_COPY.weekdaysShort[day]}</option>)}
            </Select>
          </label>
        </div>
        {workoutErrors?.name && <p role="alert" className="text-base text-destructive">{copy.needName}</p>}

        <ol className="flex flex-col gap-3">
          {fields.map((field, slot) => {
            const exercise = WORKOUT_EXERCISE_LIBRARY.find(({ id }) => id === field.exerciseId);
            const exerciseName = exercise?.name ?? field.exerciseId;
            return (
              <li key={field.id} className="flex flex-col gap-3 rounded-xl border border-border bg-background p-3">
                <div>
                  <p className="text-lg font-semibold">{exerciseName}</p>
                  {exercise && <p className="text-base text-muted-foreground">{exercise.targetMuscles}</p>}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <NumberBox label={copy.sets} min={1} max={6} {...register(`workouts.${index}.exercises.${slot}.sets`, numberField)} />
                  <NumberBox label={copy.repsFrom} min={1} max={30} {...register(`workouts.${index}.exercises.${slot}.repMin`, numberField)} />
                  <NumberBox label={copy.repsTo} min={1} max={30} {...register(`workouts.${index}.exercises.${slot}.repMax`, numberField)} />
                  <NumberBox label={copy.rest} min={30} max={300} step={15} {...register(`workouts.${index}.exercises.${slot}.restSeconds`, numberField)} />
                </div>
                {workoutErrors?.exercises?.[slot] && (
                  <p role="alert" className="text-base text-destructive">
                    {workoutErrors.exercises[slot]?.repMax?.message ?? TRAINING_COPY.errors.VALIDATION_ERROR}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" size="sm" disabled={slot === 0} aria-label={copy.moveUpLabel(exerciseName)}
                    onClick={() => move(slot, slot - 1)}>
                    <ArrowUp className="size-4" aria-hidden="true" />{copy.moveUp}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" disabled={slot === fields.length - 1} aria-label={copy.moveDownLabel(exerciseName)}
                    onClick={() => move(slot, slot + 1)}>
                    <ArrowDown className="size-4" aria-hidden="true" />{copy.moveDown}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" aria-label={copy.removeExerciseLabel(exerciseName)} onClick={() => remove(slot)}
                    className="text-destructive hover:text-destructive">
                    <Trash2 className="size-4" aria-hidden="true" />{copy.removeExercise}
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>
        {workoutErrors?.exercises?.root && <p role="alert" className="text-base text-destructive">{copy.needExercise}</p>}
        {workoutErrors?.exercises?.message && <p role="alert" className="text-base text-destructive">{copy.needExercise}</p>}

        {picking ? (
          <ExercisePicker options={options} exclude={fields.map(({ exerciseId }) => exerciseId)}
            onPick={(exercise) => { append(planExerciseDefaults(exercise, goal, experience)); setPicking(false); }} />
        ) : (
          <Button type="button" variant="outline" onClick={() => setPicking(true)} disabled={fields.length >= 8}>
            <Plus className="size-5" aria-hidden="true" />{copy.addExercise}
          </Button>
        )}
        {onRemove && (
          <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={onRemove}>
            <Trash2 className="size-5" aria-hidden="true" />{copy.removeWorkout}
          </Button>
        )}
      </div>
    </details>
  );
};
