import type { WorkoutPlan } from '@/features/fitness/service/workout-plan.service';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
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

export const WorkoutPlanExerciseEditor = ({
  defaultPlan,
  options,
  selections,
  saving,
  saved,
  error,
  onSelect,
  onSave,
  onReset,
}: WorkoutPlanExerciseEditorProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Customize exercise choices</CardTitle>
      <CardDescription>
        Swap movements from the exercise library that match your saved
        equipment. The generated number of exercise slots, sets, reps, and rest
        guidance remain unchanged.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-5">
      {defaultPlan.sessions.map((session, sessionIndex) => (
        <fieldset
          key={`${session.title}-${sessionIndex}`}
          className="grid gap-3"
          disabled={saving}
        >
          <legend className="text-sm font-semibold">
            Session {sessionIndex + 1}: {session.title}
          </legend>
          {session.exercises.map((exercise, slotIndex) => {
            const selectedIds = selections[sessionIndex] ?? [];
            return (
              <label
                key={`${exercise.id}-${slotIndex}`}
                htmlFor={`plan-${sessionIndex}-exercise-${slotIndex}`}
                className="grid gap-1.5 text-sm"
              >
                Exercise {slotIndex + 1}
                <select
                  id={`plan-${sessionIndex}-exercise-${slotIndex}`}
                  value={selectedIds[slotIndex] ?? exercise.id}
                  onChange={(event) =>
                    onSelect(sessionIndex, slotIndex, event.target.value)
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3"
                >
                  {options.map((option) => (
                    <option
                      key={option.id}
                      value={option.id}
                      disabled={
                        selectedIds.includes(option.id) &&
                        selectedIds[slotIndex] !== option.id
                      }
                    >
                      {option.name} · {option.targetMuscles}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
        </fieldset>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save exercise choices'}
        </Button>
        <Button variant="outline" onClick={onReset} disabled={saving}>
          Restore generated plan
        </Button>
        {saved && (
          <p className="text-sm text-muted-foreground" role="status">
            Exercise choices saved.
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);
