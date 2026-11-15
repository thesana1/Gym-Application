'use client';

import { useEffect, useRef } from 'react';

import { WorkoutLogForm } from '@/features/fitness/components/workout-log-form';
import { useWorkoutLogs } from '@/features/fitness/hooks/use-workout-logs';
import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import type { WorkoutSession } from '@/features/fitness/service/workout-plan.service';
import type { WorkoutLogInput, WorkoutLogType } from '@/features/fitness/validations/workout-log.validation';
import { WORKOUTS_COPY } from '@/shared/const/copy-workouts.const';
import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';

const copy = WORKOUTS_COPY.log;

export const NEW_WORKOUT: WorkoutLogInput = {
  title: copy.defaultName,
  completedAt: '',
  notes: '',
  exercises: [{ exerciseId: WORKOUT_EXERCISE_LIBRARY[0]?.id ?? '', sets: [{ repetitions: '', weightKg: '' }] }],
};

const toPlannedSessionInput = (session: WorkoutSession): WorkoutLogInput => ({
  title: session.title,
  completedAt: '',
  notes: '',
  exercises: session.exercises.map((exercise) => ({
    exerciseId: exercise.id,
    sets: Array.from({ length: exercise.sets }, () => ({ repetitions: '', weightKg: '' })),
  })),
});

const toLocalDateTime = (value: string) => {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

export const toInputValues = (workout: WorkoutLog): WorkoutLogInput => ({
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

type WorkoutLogManagerProps = {
  startSession?: WorkoutSession;
  onDone?: (saved: boolean) => void;
};

// The save form for a finished workout: the chosen plan session prefilled, or a free workout.
export const WorkoutLogManager = ({ startSession, onDone }: WorkoutLogManagerProps = {}) => {
  const { saving, error, saveWorkout } = useWorkoutLogs();
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const handleSave = async (value: WorkoutLogType) => {
    if (await saveWorkout(null, value)) onDone?.(true);
  };

  return (
    <section id="workout-log" tabIndex={-1} aria-labelledby="workout-log-title" className="scroll-mt-24 rounded-2xl border border-border bg-card p-5">
      <h2 id="workout-log-title" className="text-2xl font-semibold">{startSession?.title ?? copy.title}</h2>
      <p className="mt-1 text-lg text-muted-foreground">{copy.help}</p>
      {error && <p ref={errorRef} tabIndex={-1} role="alert" className="mt-4 text-base text-destructive">{error}</p>}
      <div className="mt-5">
        <WorkoutLogForm key={startSession ? `planned-${startSession.title}` : 'new-workout'}
          initialValues={startSession ? toPlannedSessionInput(startSession) : NEW_WORKOUT}
          saving={saving} onCancel={() => onDone?.(false)} onSubmit={handleSave} />
      </div>
    </section>
  );
};
