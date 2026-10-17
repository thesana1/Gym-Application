'use client';

import { useCallback, useEffect, useState } from 'react';

import { TrainingScheduleEditor } from '@/features/fitness/components/training-schedule-editor';
import type { TrainingSchedule } from '@/features/fitness/service/training-schedule.service';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { http } from '@/shared/lib/http';

type PlanSession = {
  title: string;
};

type WeeklyWorkoutScheduleProps = {
  sessions: PlanSession[];
};

type ScheduleResponse = TrainingSchedule;

const getErrorMessage = (error: unknown, action: 'load' | 'save') => {
  if (!(error instanceof Error)) {
    return `Could not ${action} your schedule. Please try again.`;
  }
  if (error.message === 'PROFILE_REQUIRED') {
    return 'Set up your fitness profile before scheduling plan sessions.';
  }
  if (error.message === 'VALIDATION_ERROR') {
    return 'That schedule does not match your current plan. Reload and try again.';
  }
  return `Could not ${action} your schedule. Please try again.`;
};

export const WeeklyWorkoutSchedule = ({
  sessions,
}: WeeklyWorkoutScheduleProps) => {
  const [assignments, setAssignments] = useState<Record<number, number | ''>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLoadFailed(false);
    try {
      const schedule = await http.get<ScheduleResponse>('/fitness/schedule');
      const currentAssignments: Record<number, number | ''> = {};
      sessions.forEach((_, sessionIndex) => {
        currentAssignments[sessionIndex] = '';
      });
      schedule.assignments.forEach(({ weekday, sessionIndex }) => {
        if (sessionIndex < sessions.length) {
          currentAssignments[sessionIndex] = weekday;
        }
      });
      setAssignments(currentAssignments);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'load'));
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [sessions]);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  const saveSchedule = async (nextAssignments: Record<number, number | ''>) => {
    setSaving(true);
    setError(null);
    setSaved(false);
    const body = {
      assignments: Object.entries(nextAssignments)
        .filter(([, weekday]) => weekday !== '')
        .map(([sessionIndex, weekday]) => ({
          weekday: Number(weekday),
          sessionIndex: Number(sessionIndex),
        })),
    };
    try {
      const result = await http.put<ScheduleResponse>(
        '/fitness/schedule',
        body
      );
      const updatedAssignments: Record<number, number | ''> = {};
      sessions.forEach((_, sessionIndex) => {
        updatedAssignments[sessionIndex] = '';
      });
      result.assignments.forEach(({ weekday, sessionIndex }) => {
        updatedAssignments[sessionIndex] = weekday;
      });
      setAssignments(updatedAssignments);
      setSaved(true);
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'save'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Choose your training days</CardTitle>
        <CardDescription>
          Assign plan sessions to weekdays that suit you. Leave a session
          unscheduled if you prefer; other days are not a recommendation to
          train. This schedule has no reminders.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground" role="status">
            Loading your schedule…
          </p>
        ) : loadFailed ? (
          <div className="flex items-center gap-3">
            <p className="text-sm text-destructive" role="alert">{error}</p>
            <Button variant="outline" onClick={() => void loadSchedule()}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            <TrainingScheduleEditor
              sessions={sessions}
              assignments={assignments}
              saving={saving}
              onAssignmentChange={(sessionIndex, weekday) => {
                setSaved(false);
                setAssignments((current) => ({
                  ...current,
                  [sessionIndex]: weekday,
                }));
              }}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => void saveSchedule(assignments)}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save schedule'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const emptySchedule = sessions.reduce<Record<number, number | ''>>(
                    (next, _, index) => {
                      next[index] = '';
                      return next;
                    },
                    {}
                  );
                  setAssignments(emptySchedule);
                  void saveSchedule(emptySchedule);
                }}
                disabled={
                  saving ||
                  !Object.values(assignments).some((weekday) => weekday !== '')
                }
              >
                Clear schedule
              </Button>
              {saved && (
                <p className="text-sm text-muted-foreground" role="status">
                  Schedule saved.
                </p>
              )}
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
            </div>
          </>
        )}
        {error && !loading && !loadFailed && (
          <p className="text-sm text-destructive" role="alert">{error}</p>
        )}
      </CardContent>
    </Card>
  );
};
