import type { WorkoutPlan } from '@/features/fitness/service/workout-plan.service';
import { Button } from '@/shared/components/ui/button';
import { Select } from '@/shared/components/ui/select';
import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { WORKOUTS_COPY } from '@/shared/const/copy-workouts.const';
import type { WorkoutExerciseDefinition } from '@/shared/types/workout';

type WorkoutPlanExerciseEditorProps = {
  defaultPlan: WorkoutPlan;
  options: WorkoutExerciseDefinition[];
  selections: string[][];
  saving: boolean;
  saved: boolean;
  error: string | null;
  onSelect: (sessionIndex: number, slotIndex: number, exerciseId: string) => void;
  onSave: () => void;
  onReset: () => void;
};

const copy = WORKOUTS_COPY.swap;

export const WorkoutPlanExerciseEditor = ({
  defaultPlan, options, selections, saving, saved, error, onSelect, onSave, onReset,
}: WorkoutPlanExerciseEditorProps) => (
  <div className="flex flex-col gap-5">
    <p className="text-base text-muted-foreground">{copy.description}</p>
    {defaultPlan.sessions.map((session, sessionIndex) => (
      <fieldset key={`${session.title}-${sessionIndex}`} className="flex flex-col gap-3" disabled={saving}>
        <legend className="mb-2 text-lg font-semibold">{WORKOUTS_COPY.view.workoutNumber(sessionIndex)}: {session.title}</legend>
        {session.exercises.map((exercise, slotIndex) => {
          const selectedIds = selections[sessionIndex] ?? [];
          return (
            <label key={`${exercise.id}-${slotIndex}`} htmlFor={`plan-${sessionIndex}-exercise-${slotIndex}`}
              className="flex flex-col gap-2 text-base font-medium">
              {copy.slot(slotIndex)}
              <Select id={`plan-${sessionIndex}-exercise-${slotIndex}`} value={selectedIds[slotIndex] ?? exercise.id}
                onChange={(event) => onSelect(sessionIndex, slotIndex, event.target.value)}>
                {options.map((option) => (
                  <option key={option.id} value={option.id}
                    disabled={selectedIds.includes(option.id) && selectedIds[slotIndex] !== option.id}>
                    {option.name}
                  </option>
                ))}
              </Select>
            </label>
          );
        })}
      </fieldset>
    ))}
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Button onClick={onSave} disabled={saving}>{saving ? COMMON_COPY.saving : copy.save}</Button>
      <Button variant="outline" onClick={onReset} disabled={saving}>{copy.reset}</Button>
      {saved && <p className="text-base font-medium text-primary" role="status">{copy.saved}</p>}
      {error && <p className="text-base text-destructive" role="alert">{error}</p>}
    </div>
  </div>
);
