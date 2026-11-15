'use client';

import { useCallback, useEffect, useState } from 'react';

import { WorkoutLogFilters } from '@/features/fitness/components/workout-log-filters';
import { WorkoutLogForm } from '@/features/fitness/components/workout-log-form';
import { WorkoutLogHistory } from '@/features/fitness/components/workout-log-history';
import { toInputValues } from '@/features/fitness/components/workout-log-manager';
import { useWorkoutLogs } from '@/features/fitness/hooks/use-workout-logs';
import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import type { WorkoutLogType } from '@/features/fitness/validations/workout-log.validation';
import { WORKOUTS_COPY } from '@/shared/const/copy-workouts.const';

type Filters = { from?: string; to?: string; exerciseId?: string };

const copy = WORKOUTS_COPY.history;

export const WorkoutHistoryPanel = () => {
  const { workouts, loading, saving, error, loadWorkouts, saveWorkout, deleteWorkout, setError } = useWorkoutLogs();
  const [filters, setFilters] = useState<Filters>({});
  const [editing, setEditing] = useState<WorkoutLog | null>(null);

  const refresh = useCallback(() => void loadWorkouts(filters), [filters, loadWorkouts]);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSave = async (value: WorkoutLogType) => {
    if (editing && await saveWorkout(editing.id, value)) {
      setEditing(null);
      refresh();
    }
  };

  const handleDelete = async (workout: WorkoutLog) => {
    if (!window.confirm(copy.confirmDelete(workout.title))) return;
    if (await deleteWorkout(workout.id)) refresh();
  };

  if (editing) {
    return (
      <section aria-labelledby="edit-workout" className="rounded-2xl border border-border bg-card p-5">
        <h2 id="edit-workout" className="mb-5 text-2xl font-semibold">{copy.editing}</h2>
        {error && <p role="alert" className="mb-4 text-base text-destructive">{error}</p>}
        <WorkoutLogForm key={editing.id} initialValues={toInputValues(editing)} saving={saving}
          onCancel={() => { setEditing(null); setError(null); }} onSubmit={handleSave} />
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <WorkoutLogFilters loading={loading} onApply={setFilters} onClear={() => setFilters({})} />
      {error && <p role="alert" className="text-base text-destructive">{error}</p>}
      {!loading && workouts.length > 0 && <p className="text-base font-medium text-muted-foreground">{copy.count(workouts.length)}</p>}
      <WorkoutLogHistory workouts={workouts} loading={loading} onEdit={setEditing} onDelete={handleDelete} />
    </div>
  );
};
