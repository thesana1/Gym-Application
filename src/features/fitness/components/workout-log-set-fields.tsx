import { Minus, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormState, type Control, type UseFormRegister } from 'react-hook-form';

import type { WorkoutLogInput, WorkoutLogType } from '@/features/fitness/validations/workout-log.validation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { WORKOUTS_COPY } from '@/shared/const/copy-workouts.const';

type WorkoutLogSetFieldsProps = {
  control: Control<WorkoutLogInput, undefined, WorkoutLogType>;
  exerciseIndex: number;
  register: UseFormRegister<WorkoutLogInput>;
  removeExercise: () => void;
};

const copy = WORKOUTS_COPY.log;

export const WorkoutLogSetFields = ({ control, exerciseIndex, register, removeExercise }: WorkoutLogSetFieldsProps) => {
  const { errors } = useFormState({ control });
  const { fields, append, remove } = useFieldArray({ control, name: `exercises.${exerciseIndex}.sets` });
  const setErrors = errors.exercises?.[exerciseIndex]?.sets;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-6 gap-2 text-base font-medium text-muted-foreground" aria-hidden="true">
        <span className="col-span-2" />
        <span className="col-span-2">{copy.reps}</span>
        <span className="col-span-2">{copy.weightOptional}</span>
      </div>
      {fields.map((set, setIndex) => (
        <div key={set.id} className="grid grid-cols-6 items-center gap-2">
          <span className="col-span-2 text-base font-semibold">{copy.set(setIndex)}</span>
          <Input className="col-span-2 text-center text-lg tabular-nums" type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="off"
            {...register(`exercises.${exerciseIndex}.sets.${setIndex}.repetitions` as const)}
            aria-label={copy.repsLabel(setIndex)} aria-invalid={Boolean(setErrors?.[setIndex]?.repetitions)} />
          <Input className="col-span-2 text-center text-lg tabular-nums" type="text" inputMode="decimal" autoComplete="off"
            {...register(`exercises.${exerciseIndex}.sets.${setIndex}.weightKg` as const)}
            aria-label={copy.weightLabel(setIndex)} aria-invalid={Boolean(setErrors?.[setIndex]?.weightKg)} />
          {(setErrors?.[setIndex]?.repetitions || setErrors?.[setIndex]?.weightKg) && (
            <p role="alert" className="col-span-6 text-base text-destructive">
              {setErrors?.[setIndex]?.repetitions?.message ?? setErrors?.[setIndex]?.weightKg?.message}
            </p>
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" disabled={fields.length >= 10}
          onClick={() => append({ repetitions: '', weightKg: '' })}>
          <Plus className="size-4" aria-hidden="true" />{copy.addSet}
        </Button>
        {fields.length > 1 && (
          <Button type="button" variant="ghost" size="sm" onClick={() => remove(fields.length - 1)}>
            <Minus className="size-4" aria-hidden="true" />{copy.removeSet}
          </Button>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={removeExercise} className="text-muted-foreground">
          <Trash2 className="size-4" aria-hidden="true" />
          {copy.removeExercise}
        </Button>
      </div>
    </div>
  );
};
