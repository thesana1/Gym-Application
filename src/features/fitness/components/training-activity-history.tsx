'use client';

import { useCallback, useEffect, useState } from 'react';

import type { TrainingActivity } from '@/features/fitness/service/training-activity.service';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { http } from '@/shared/lib/http';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Sign in to review your training activity.',
  VALIDATION_ERROR: 'Choose a supported report range.',
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? ERROR_MESSAGES[error.message] ?? 'Could not load your training activity.'
    : 'Could not load your training activity.';

export const TrainingActivityHistory = () => {
  const [weeks, setWeeks] = useState<4 | 8>(4);
  const [activity, setActivity] = useState<TrainingActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setActivity(
        await http.get<TrainingActivity>('/fitness/activity', {
          params: { weeks },
        })
      );
    } catch (loadError) {
      setActivity(null);
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [weeks]);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity]);

  const highestWorkoutCount = Math.max(
    1,
    ...(activity?.periods.map(({ workoutCount }) => workoutCount) ?? [])
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your own log history
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
          Training activity
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review workout logs, sets, and exercise variety in rolling
          seven-day periods. These counts describe what you entered, not training
          quality, health outcomes, or a recommended schedule.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report range</CardTitle>
          <CardDescription>
            Each period is a consecutive seven-day window ending at the current
            time. Only your own saved workout history is used.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant={weeks === 4 ? 'default' : 'outline'}
            aria-pressed={weeks === 4}
            onClick={() => setWeeks(4)}
            disabled={loading}
          >
            Past 4 weeks
          </Button>
          <Button
            variant={weeks === 8 ? 'default' : 'outline'}
            aria-pressed={weeks === 8}
            onClick={() => setWeeks(8)}
            disabled={loading}
          >
            Past 8 weeks
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <p className="text-sm text-destructive" role="alert">{error}</p>
            <Button variant="outline" onClick={() => void loadActivity()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground" role="status">
          Loading training history…
        </p>
      ) : activity ? (
        <section aria-label={`${activity.weeks}-week training activity`} className="grid gap-4">
          {activity.periods.map((period) => (
            <Card key={period.start}>
              <CardHeader>
                <CardTitle className="text-base">
                  {formatDate(period.start)} – {formatDate(period.end)}
                </CardTitle>
                <CardDescription>
                  {period.workoutCount} workout
                  {period.workoutCount === 1 ? '' : 's'} logged
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <progress
                  className="h-2 w-full accent-primary"
                  max={highestWorkoutCount}
                  value={period.workoutCount}
                  aria-label={`${period.workoutCount} workouts logged in this period`}
                />
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Sets logged</dt>
                    <dd className="font-semibold">{period.setCount}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Exercises</dt>
                    <dd className="font-semibold">{period.distinctExerciseCount}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Empty periods mean no workout logs were found for that window. This
        history does not assess whether your activity is sufficient or
        appropriate for you.
      </p>
    </div>
  );
};
