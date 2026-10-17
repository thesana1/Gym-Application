'use client';

import { useCallback, useState } from 'react';

import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import type { WorkoutLogType } from '@/features/fitness/validations/workout-log.validation';
import { http } from '@/shared/lib/http';

type WorkoutLogFilters = {
  from?: string;
  to?: string;
  exerciseId?: string;
};

export const useWorkoutLogs = () => {
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorkouts = useCallback(async (filters: WorkoutLogFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await http.get<WorkoutLog[]>('/fitness/workouts', {
        params: filters,
      });
      setWorkouts(result);
    } catch {
      setError('We could not load your workout history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveWorkout = useCallback(
    async (workoutId: string | null, data: WorkoutLogType): Promise<boolean> => {
      setSaving(true);
      setError(null);

      try {
        if (workoutId) {
          await http.patch(`/fitness/workouts/${workoutId}`, data);
        } else {
          await http.post('/fitness/workouts', data);
        }
        return true;
      } catch {
        setError('We could not save this workout. Please try again.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const deleteWorkout = useCallback(async (workoutId: string): Promise<boolean> => {
    setError(null);
    try {
      await http.delete(`/fitness/workouts/${workoutId}`);
      return true;
    } catch {
      setError('We could not delete this workout. Please try again.');
      return false;
    }
  }, []);

  return {
    workouts,
    loading,
    saving,
    error,
    loadWorkouts,
    saveWorkout,
    deleteWorkout,
    setError,
  };
};
