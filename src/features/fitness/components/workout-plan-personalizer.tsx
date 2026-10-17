'use client';

import { useCallback, useEffect, useState } from 'react';

import { WeeklyWorkoutSchedule } from '@/features/fitness/components/weekly-workout-schedule';
import { WorkoutLogManager } from '@/features/fitness/components/workout-log-manager';
import { WorkoutPlanExerciseEditor } from '@/features/fitness/components/workout-plan-exercise-editor';
import { WorkoutPlanView } from '@/features/fitness/components/workout-plan-view';
import type { WorkoutPlanCustomization } from '@/features/fitness/service/workout-plan-customization.service';
import type { WorkoutPlan } from '@/features/fitness/service/workout-plan.service';
import { Button } from '@/shared/components/ui/button';
import { http } from '@/shared/lib/http';

type WorkoutPlanPersonalizerProps = {
  initialPlan: WorkoutPlan;
  startSessionIndex?: number;
};

const getSelections = (plan: WorkoutPlan) =>
  plan.sessions.map((session) => session.exercises.map(({ id }) => id));

const getErrorMessage = (error: unknown) => {
  if (!(error instanceof Error)) return 'Could not update your workout plan.';
  if (error.message === 'VALIDATION_ERROR') {
    return 'Those exercise choices do not match your current profile. Reload and try again.';
  }
  if (error.message === 'PROFILE_REQUIRED') {
    return 'Set up a fitness profile to customize your plan.';
  }
  return 'Could not update your workout plan. Please try again.';
};

export const WorkoutPlanPersonalizer = ({
  initialPlan,
  startSessionIndex,
}: WorkoutPlanPersonalizerProps) => {
  const [customization, setCustomization] =
    useState<WorkoutPlanCustomization | null>(null);
  const [selections, setSelections] = useState<string[][]>(
    getSelections(initialPlan)
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCustomization = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await http.get<WorkoutPlanCustomization>('/fitness/plan');
      setCustomization(result);
      setSelections(getSelections(result.plan));
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCustomization();
  }, [loadCustomization]);

  const saveCustomization = async (reset = false) => {
    const defaultPlan = customization?.defaultPlan ?? initialPlan;
    const overrides = reset
      ? []
      : selections.flatMap((exerciseIds, sessionIndex) => {
        const defaultIds =
            defaultPlan.sessions[sessionIndex]?.exercises.map(({ id }) => id) ??
            [];
        return exerciseIds.every((id, index) => id === defaultIds[index])
          ? []
          : [{ sessionIndex, exerciseIds }];
      });

    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const result = await http.put<WorkoutPlanCustomization>('/fitness/plan', {
        overrides,
      });
      setCustomization(result);
      setSelections(getSelections(result.plan));
      setSaved(true);
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const plan = customization?.plan ?? initialPlan;
  const defaultPlan = customization?.defaultPlan ?? initialPlan;
  const startSession =
    startSessionIndex === undefined
      ? undefined
      : plan.sessions[startSessionIndex];

  return (
    <>
      <WorkoutPlanView plan={plan} />
      {loading ? (
        <p className="text-sm text-muted-foreground" role="status">
          Loading your saved exercise choices…
        </p>
      ) : customization ? (
        <WorkoutPlanExerciseEditor
          defaultPlan={customization.defaultPlan}
          options={customization.options}
          selections={selections}
          saving={saving}
          saved={saved}
          error={error}
          onSelect={(sessionIndex, slotIndex, exerciseId) => {
            setSaved(false);
            setSelections((current) =>
              current.map((session, index) =>
                index === sessionIndex
                  ? session.map((id, slot) =>
                    slot === slotIndex ? exerciseId : id
                  )
                  : session
              )
            );
          }}
          onSave={() => void saveCustomization()}
          onReset={() => {
            setSelections(getSelections(defaultPlan));
            void saveCustomization(true);
          }}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-destructive" role="alert">{error}</p>
          <Button variant="outline" onClick={() => void loadCustomization()}>
            Retry loading plan choices
          </Button>
        </div>
      )}
      <WeeklyWorkoutSchedule sessions={plan.sessions} />
      <WorkoutLogManager
        key={
          startSession
            ? `${startSessionIndex}-${startSession.exercises.map(({ id }) => id).join('-')}`
            : 'manual-workout-log'
        }
        startSession={startSession}
      />
    </>
  );
};
