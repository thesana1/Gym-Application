'use client';

import { useCallback, useEffect, useState } from 'react';

import type { PersonalExerciseRecord } from '@/features/fitness/service/personal-record.service';
import type { WorkoutLogType } from '@/features/fitness/validations/workout-log.validation';
import { trainingErrorMessage } from '@/features/training/hooks/use-training-plan';
import type { WorkoutSession } from '@/features/training/service/training-plan.service';
import { http } from '@/shared/lib/http';

// Loads one plan workout with its targets, plus best lifts so the finish screen can celebrate new ones.
export const useWorkoutSession = (workoutId: string) => {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [records, setRecords] = useState<PersonalExerciseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [loaded, best] = await Promise.all([
        http.get<WorkoutSession>(`/training/workouts/${encodeURIComponent(workoutId)}`),
        http.get<PersonalExerciseRecord[]>('/fitness/records'),
      ]);
      setSession(loaded);
      setRecords(best);
    } catch (loadError) {
      setError(trainingErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [workoutId]);

  useEffect(() => {
    void load();
  }, [load]);

  const complete = useCallback((log: WorkoutLogType) => http.post('/fitness/workouts', log), []);

  return { session, records, loading, error, load, complete };
};
