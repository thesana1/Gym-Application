'use client';

import { Pencil, Trash2 } from 'lucide-react';

import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

type WorkoutLogHistoryProps = {
  workouts: WorkoutLog[];
  loading: boolean;
  error: string | null;
  onEdit: (workout: WorkoutLog) => void;
  onDelete: (workout: WorkoutLog) => void;
};

const formatCompletedAt = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export const WorkoutLogHistory = ({
  workouts,
  loading,
  error,
  onEdit,
  onDelete,
}: WorkoutLogHistoryProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Workout history</CardTitle>
      <CardDescription>
        {workouts.length
          ? `${workouts.length} workout${workouts.length === 1 ? '' : 's'} in this view.`
          : 'Your saved workouts will appear here.'}
      </CardDescription>
    </CardHeader>
    <CardContent>
      {error && (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="text-sm text-muted-foreground" role="status">
          Loading workout history...
        </p>
      ) : workouts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No workouts found. Log a completed session to start building your
          history.
        </p>
      ) : (
        <ul className="space-y-4">
          {workouts.map((workout) => (
            <li key={workout.id} className="rounded-md border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{workout.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatCompletedAt(workout.completedAt)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${workout.title}`}
                    onClick={() => onEdit(workout)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${workout.title}`}
                    onClick={() => onDelete(workout)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <ul className="mt-3 space-y-2">
                {workout.exercises.map((exercise, index) => (
                  <li
                    key={`${exercise.exerciseId}-${index}`}
                    className="flex flex-col justify-between gap-1 text-sm sm:flex-row"
                  >
                    <span className="font-medium">{exercise.exerciseName}</span>
                    <span className="text-muted-foreground">
                      {exercise.sets
                        .map(
                          (set) =>
                            `${set.repetitions} reps${
                              set.weightKg === undefined ? '' : ` @ ${set.weightKg} kg`
                            }`
                        )
                        .join(' · ')}
                    </span>
                  </li>
                ))}
              </ul>
              {workout.notes && (
                <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                  {workout.notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);
