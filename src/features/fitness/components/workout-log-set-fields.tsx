import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, type Control, type UseFormRegister } from 'react-hook-form';

import type {
  WorkoutLogInput,
  WorkoutLogType,
} from '@/features/fitness/validations/workout-log.validation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

type WorkoutLogSetFieldsProps = {
  control: Control<WorkoutLogInput, undefined, WorkoutLogType>;
  exerciseIndex: number;
  register: UseFormRegister<WorkoutLogInput>;
  removeExercise: () => void;
};

export const WorkoutLogSetFields = ({
  control,
  exerciseIndex,
  register,
  removeExercise,
}: WorkoutLogSetFieldsProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `exercises.${exerciseIndex}.sets`,
  });

  return (
    <fieldset className="rounded-md border border-border p-3">
      <legend className="px-1 text-sm font-medium">Sets</legend>
      <div className="space-y-3">
        {fields.map((set, setIndex) => (
          <div key={set.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
            <label className="grid gap-1 text-xs text-muted-foreground">
              Set {setIndex + 1} · reps
              <Input
                type="number"
                min="1"
                max="100"
                step="1"
                {...register(
                  `exercises.${exerciseIndex}.sets.${setIndex}.repetitions` as const
                )}
                aria-label={`Set ${setIndex + 1} repetitions`}
              />
            </label>
            <label className="grid gap-1 text-xs text-muted-foreground">
              Weight kg (optional)
              <Input
                type="number"
                min="0"
                max="500"
                step="0.1"
                {...register(
                  `exercises.${exerciseIndex}.sets.${setIndex}.weightKg` as const
                )}
                aria-label={`Set ${setIndex + 1} weight in kilograms`}
              />
            </label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove set ${setIndex + 1}`}
              disabled={fields.length <= 1}
              onClick={() => remove(setIndex)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={fields.length >= 10}
          onClick={() => append({ repetitions: '10', weightKg: '' })}
        >
          <Plus className="size-4" />
          Add set
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={removeExercise}
        >
          Remove exercise
        </Button>
      </div>
    </fieldset>
  );
};
