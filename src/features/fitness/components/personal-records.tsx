'use client';

import { useCallback, useEffect, useState } from 'react';

import type { PersonalExerciseRecord } from '@/features/fitness/service/personal-record.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { http } from '@/shared/lib/http';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
    new Date(value)
  );

export const PersonalRecords = () => {
  const [records, setRecords] = useState<PersonalExerciseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    setError(null);
    try {
      const data = await http.get<PersonalExerciseRecord[]>('/fitness/records');
      setRecords(data);
    } catch {
      setError('Could not load workout records. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your logged history
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Personal records</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Exact sets recorded in your workout history. These are not estimated
          one-rep maximums or a measure of health. Editing or deleting a workout
          automatically updates these records.
        </p>
      </header>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="text-sm text-muted-foreground" role="status">
          Loading your records…
        </p>
      ) : records.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No workout records yet</CardTitle>
            <CardDescription>
              Log a workout with exercise sets to see your highest recorded
              repetitions and heaviest explicitly entered weights here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <section aria-label="Personal records" className="grid gap-4">
          {records.map((record) => (
            <Card key={record.exerciseId}>
              <CardHeader>
                <CardTitle className="text-base">{record.exerciseName}</CardTitle>
                <CardDescription>
                  Logged in {record.workoutCount}{' '}
                  {record.workoutCount === 1 ? 'workout' : 'workouts'}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-md border p-4">
                  <h2 className="text-sm font-semibold">Heaviest logged set</h2>
                  {record.heaviestSet ? (
                    <p className="mt-2 text-sm">
                      {record.heaviestSet.weightKg} kg ×{' '}
                      {record.heaviestSet.repetitions} reps
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {formatDate(record.heaviestSet.completedAt)}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No weight was recorded for this exercise.
                    </p>
                  )}
                </div>
                <div className="rounded-md border p-4">
                  <h2 className="text-sm font-semibold">Highest-repetition set</h2>
                  <p className="mt-2 text-sm">
                    {record.highestRepSet.repetitions} reps
                    {record.highestRepSet.weightKg === undefined
                      ? ' · no weight recorded'
                      : ` @ ${record.highestRepSet.weightKg} kg`}
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {formatDate(record.highestRepSet.completedAt)}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
};
