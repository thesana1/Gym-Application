'use client';

import { Pencil, Trash2 } from 'lucide-react';

import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { WORKOUTS_COPY } from '@/shared/const/copy-workouts.const';

type WorkoutLogHistoryProps = {
  workouts: WorkoutLog[];
  loading: boolean;
  onEdit: (workout: WorkoutLog) => void;
  onDelete: (workout: WorkoutLog) => void;
};

const copy = WORKOUTS_COPY.history;

const formatCompletedAt = (value: string) =>
  new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));

export const WorkoutLogHistory = ({ workouts, loading, onEdit, onDelete }: WorkoutLogHistoryProps) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-3" role="status" aria-label={copy.loading}>
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }
  if (workouts.length === 0) return <EmptyState message={copy.empty} />;

  return (
    <ul className="flex flex-col gap-3">
      {workouts.map((workout) => (
        <li key={workout.id} className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-xl font-semibold">{workout.title}</h3>
          <p className="mt-1 text-base text-muted-foreground">{formatCompletedAt(workout.completedAt)}</p>
          <ul className="mt-4 flex flex-col gap-2">
            {workout.exercises.map((exercise, index) => (
              <li key={`${exercise.exerciseId}-${index}`} className="text-base">
                <span className="font-semibold">{exercise.exerciseName}</span>
                <span className="block tabular-nums text-muted-foreground">
                  {exercise.sets.map((set) => copy.setSummary(set.repetitions, set.weightKg)).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
          {workout.notes && <p className="mt-3 whitespace-pre-wrap text-base text-muted-foreground">{workout.notes}</p>}
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" aria-label={copy.editLabel(workout.title)} onClick={() => onEdit(workout)}>
              <Pencil className="size-4" aria-hidden="true" />{copy.edit}
            </Button>
            <Button variant="ghost" size="sm" aria-label={copy.deleteLabel(workout.title)} onClick={() => onDelete(workout)}
              className="text-destructive hover:text-destructive">
              <Trash2 className="size-4" aria-hidden="true" />{copy.delete}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
};
