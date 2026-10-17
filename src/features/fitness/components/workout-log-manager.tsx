'use client';

import { useCallback, useEffect, useState } from 'react';

import { WorkoutLogEditorCard } from '@/features/fitness/components/workout-log-editor-card';
import { WorkoutLogFilters } from '@/features/fitness/components/workout-log-filters';
import { WorkoutLogHistory } from '@/features/fitness/components/workout-log-history';
import { useWorkoutLogs } from '@/features/fitness/hooks/use-workout-logs';
import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import type { WorkoutSession } from '@/features/fitness/service/workout-plan.service';
import type { WorkoutLogInput, WorkoutLogType } from '@/features/fitness/validations/workout-log.validation';
import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';

const NEW_WORKOUT: WorkoutLogInput = {
  title: 'Workout',
  completedAt: '',
  notes: '',
  exercises: [
    {
      exerciseId: WORKOUT_EXERCISE_LIBRARY[0]?.id ?? '',
      sets: [{ repetitions: '10', weightKg: '' }],
    },
  ],
};

const toPlannedSessionInput = (session: WorkoutSession): WorkoutLogInput => ({
  title: session.title,
  completedAt: '',
  notes: '',
  exercises: session.exercises.map((exercise) => ({
    exerciseId: exercise.id,
    sets: Array.from({ length: exercise.sets }, () => ({
      repetitions: '',
      weightKg: '',
    })),
  })),
});

const toInputValues = (workout: WorkoutLog): WorkoutLogInput => ({
  title: workout.title,
  completedAt: toLocalDateTime(workout.completedAt),
  notes: workout.notes ?? '',
  exercises: workout.exercises.map((exercise) => ({
    exerciseId: exercise.exerciseId,
    sets: exercise.sets.map((set) => ({
      repetitions: String(set.repetitions),
      weightKg: set.weightKg === undefined ? '' : String(set.weightKg),
    })),
  })),
});

const toLocalDateTime = (value: string) => {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

type WorkoutLogManagerProps = {
  startSession?: WorkoutSession;
};

export const WorkoutLogManager = ({
  startSession,
}: WorkoutLogManagerProps = {}) => {
  const {
    workouts,
    loading,
    saving,
    error,
    loadWorkouts,
    saveWorkout,
    deleteWorkout,
    setError,
  } = useWorkoutLogs();
  const [appliedFilters, setAppliedFilters] = useState<{
    from?: string;
    to?: string;
    exerciseId?: string;
  }>({});
  const [isFormOpen, setIsFormOpen] = useState(Boolean(startSession));
  const [editingWorkout, setEditingWorkout] = useState<WorkoutLog | null>(null);

  const refresh = useCallback(() => {
    void loadWorkouts(appliedFilters);
  }, [appliedFilters, loadWorkouts]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSave = async (value: WorkoutLogType) => {
    if (await saveWorkout(editingWorkout?.id ?? null, value)) {
      setEditingWorkout(null);
      setIsFormOpen(false);
      refresh();
    }
  };

  const handleDelete = async (workout: WorkoutLog) => {
    if (!window.confirm(`Delete "${workout.title}" from your history?`)) return;
    if (await deleteWorkout(workout.id)) refresh();
  };

  const startEditing = (workout: WorkoutLog) => {
    setEditingWorkout(workout);
    setIsFormOpen(true);
    setError(null);
  };

  const cancelForm = () => {
    setIsFormOpen(false);
    setEditingWorkout(null);
    setError(null);
  };

  return (
    <section className="flex flex-col gap-5" aria-label="Workout log">
      <WorkoutLogEditorCard
        startSession={startSession}
        editingWorkout={editingWorkout}
        formOpen={isFormOpen}
        initialValues={
          editingWorkout
            ? toInputValues(editingWorkout)
            : startSession
              ? toPlannedSessionInput(startSession)
              : NEW_WORKOUT
        }
        saving={saving}
        onOpen={() => {
          setEditingWorkout(null);
          setIsFormOpen(true);
          setError(null);
        }}
        onCancel={cancelForm}
        onSubmit={handleSave}
      />

      <WorkoutLogFilters
        loading={loading}
        onApply={setAppliedFilters}
        onClear={() => setAppliedFilters({})}
      />

      <WorkoutLogHistory
        workouts={workouts}
        loading={loading}
        error={error}
        onEdit={startEditing}
        onDelete={handleDelete}
      />
    </section>
  );
};
