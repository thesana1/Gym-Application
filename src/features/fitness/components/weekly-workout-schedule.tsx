'use client';

import { useCallback, useEffect, useState } from 'react';

import { TrainingScheduleEditor } from '@/features/fitness/components/training-schedule-editor';
import type { TrainingSchedule } from '@/features/fitness/service/training-schedule.service';
import { Button } from '@/shared/components/ui/button';
import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { WORKOUTS_COPY } from '@/shared/const/copy-workouts.const';
import { http } from '@/shared/lib/http';

type PlanSession = {
  title: string;
};

type WeeklyWorkoutScheduleProps = {
  sessions: PlanSession[];
};

type ScheduleResponse = TrainingSchedule;

const getErrorMessage = (error: unknown, action: 'load' | 'save') => {
  if (error instanceof Error && error.message === 'PROFILE_REQUIRED') return WORKOUTS_COPY.errors.profileRequired;
  if (error instanceof Error && error.message === 'VALIDATION_ERROR') return WORKOUTS_COPY.errors.scheduleMismatch;
  return action === 'load' ? WORKOUTS_COPY.errors.scheduleLoad : WORKOUTS_COPY.errors.scheduleSave;
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

  const copy = WORKOUTS_COPY.schedule;
  return (
    <section aria-labelledby="schedule-title" className="rounded-2xl border border-border bg-card p-5">
      <h2 id="schedule-title" className="text-xl font-semibold">{copy.title}</h2>
      <p className="mt-1 text-base text-muted-foreground">{copy.description}</p>
      <div className="mt-5 flex flex-col gap-4">
        {loading ? (
          <p className="text-base text-muted-foreground" role="status">{copy.loading}</p>
        ) : loadFailed ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-base text-destructive" role="alert">{error}</p>
            <Button variant="outline" onClick={() => void loadSchedule()}>{COMMON_COPY.tryAgain}</Button>
          </div>
        ) : (
          <>
            <TrainingScheduleEditor sessions={sessions} assignments={assignments} saving={saving}
              onAssignmentChange={(sessionIndex, weekday) => {
                setSaved(false);
                setAssignments((current) => ({ ...current, [sessionIndex]: weekday }));
              }} />
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => void saveSchedule(assignments)} disabled={saving}>{saving ? COMMON_COPY.saving : copy.save}</Button>
              <Button variant="outline" disabled={saving || !Object.values(assignments).some((weekday) => weekday !== '')}
                onClick={() => {
                  const emptySchedule = sessions.reduce<Record<number, number | ''>>((next, _, index) => ({ ...next, [index]: '' }), {});
                  setAssignments(emptySchedule);
                  void saveSchedule(emptySchedule);
                }}>
                {copy.clear}
              </Button>
              {saved && <p className="text-base font-medium text-primary" role="status">{copy.saved}</p>}
            </div>
            {error && <p className="text-base text-destructive" role="alert">{error}</p>}
          </>
        )}
      </div>
    </section>
  );
};
