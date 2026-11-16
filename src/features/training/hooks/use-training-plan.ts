'use client';

import { useCallback, useEffect, useState } from 'react';

import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import type { PlanSuggestion } from '@/features/training/service/training-ai.service';
import type { TrainingPlan } from '@/features/training/service/training-plan.service';
import type { PlanPrioritiesType, TrainingPlanType } from '@/features/training/validations/training-plan.validation';
import { TRAINING_COPY } from '@/shared/const/copy-training.const';
import { http } from '@/shared/lib/http';

const STREAK_DAYS = 13 * 7;

export const trainingErrorMessage = (error: unknown) =>
  (error instanceof Error ? TRAINING_COPY.errors[error.message] : undefined) ?? TRAINING_COPY.errors.default;

// Loads the saved plan plus enough recent workouts to draw this week and the weekly streak.
export const useTrainingPlan = () => {
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const from = new Date(Date.now() - STREAK_DAYS * 24 * 60 * 60 * 1000).toISOString();
      const [savedPlan, recent] = await Promise.all([
        http.get<TrainingPlan | null>('/training/plan'),
        http.get<WorkoutLog[]>('/fitness/workouts', { params: { from } }),
      ]);
      setPlan(savedPlan);
      setLogs(recent);
    } catch (loadError) {
      setError(trainingErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async (next: TrainingPlanType) => {
    const saved = await http.put<TrainingPlan>('/training/plan', next);
    setPlan(saved);
    return saved;
  }, []);

  const suggest = useCallback((priorities: PlanPrioritiesType) => http.post<PlanSuggestion>('/training/plan/suggest', priorities), []);

  return { plan, logs, loading, error, load, save, suggest };
};
