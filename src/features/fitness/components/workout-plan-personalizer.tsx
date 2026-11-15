'use client';

import { CircleCheck, Plus } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { WeeklyWorkoutSchedule } from '@/features/fitness/components/weekly-workout-schedule';
import { WorkoutHistoryPanel } from '@/features/fitness/components/workout-history-panel';
import { WorkoutLogManager } from '@/features/fitness/components/workout-log-manager';
import { WorkoutPlanExerciseEditor } from '@/features/fitness/components/workout-plan-exercise-editor';
import { WorkoutPlanView } from '@/features/fitness/components/workout-plan-view';
import type { WorkoutPlanCustomization } from '@/features/fitness/service/workout-plan-customization.service';
import type { WorkoutPlan } from '@/features/fitness/service/workout-plan.service';
import { Button } from '@/shared/components/ui/button';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { WORKOUTS_COPY } from '@/shared/const/copy-workouts.const';
import { http } from '@/shared/lib/http';

export type WorkoutTab = 'today' | 'past' | 'plan';

type WorkoutPlanPersonalizerProps = {
  initialPlan: WorkoutPlan;
  startSessionIndex?: number;
  initialTab?: WorkoutTab;
};

const getSelections = (plan: WorkoutPlan) =>
  plan.sessions.map((session) => session.exercises.map(({ id }) => id));

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message === 'VALIDATION_ERROR') return WORKOUTS_COPY.errors.swapMismatch;
  if (error instanceof Error && error.message === 'PROFILE_REQUIRED') return WORKOUTS_COPY.errors.profileRequired;
  return WORKOUTS_COPY.errors.swapFailed;
};

export const WorkoutPlanPersonalizer = ({
  initialPlan,
  startSessionIndex,
  initialTab = 'today',
}: WorkoutPlanPersonalizerProps) => {
  const [logSessionIndex, setLogSessionIndex] = useState(startSessionIndex);
  const [logAttempt, setLogAttempt] = useState(0);
  const [logging, setLogging] = useState(startSessionIndex !== undefined);
  const [logSaved, setLogSaved] = useState(false);
  const startLogging = (index: number | undefined) => {
    setLogSessionIndex(index);
    setLogAttempt((attempt) => attempt + 1);
    setLogSaved(false);
    setLogging(true);
  };
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
    logSessionIndex === undefined
      ? undefined
      : plan.sessions[logSessionIndex];

  const copy = WORKOUTS_COPY;
  return (
    <Tabs defaultValue={initialTab}>
      <TabsList aria-label={copy.title}>
        <TabsTrigger value="today">{copy.tabs.today}</TabsTrigger>
        <TabsTrigger value="past">{copy.tabs.past}</TabsTrigger>
        <TabsTrigger value="plan">{copy.tabs.plan}</TabsTrigger>
      </TabsList>
      <TabsContent value="today" className="flex flex-col gap-5">
        {logging ? (
          <WorkoutLogManager key={`${logAttempt}-${logSessionIndex ?? 'manual'}`} startSession={startSession}
            onDone={(didSave) => {
              setLogging(false);
              setLogSaved(didSave);
              window.scrollTo({ top: 0 });
            }} />
        ) : (
          <>
            {logSaved && (
              <p role="status" className="flex items-center gap-2 rounded-xl bg-primary/10 p-4 text-lg font-medium">
                <CircleCheck className="size-6 shrink-0 text-primary" aria-hidden="true" />{copy.log.saved}
              </p>
            )}
            {loading && <p className="text-base text-muted-foreground" role="status">{copy.loadingChoices}</p>}
            {!loading && !customization && (
              <div className="flex flex-col items-start gap-3">
                <p className="text-base text-destructive" role="alert">{copy.loadChoicesError}</p>
                <Button variant="outline" onClick={() => void loadCustomization()}>{COMMON_COPY.tryAgain}</Button>
              </div>
            )}
            <WorkoutPlanView plan={plan} initialSessionIndex={startSessionIndex} onLogSession={(index) => startLogging(index)} />
            <Button variant="outline" onClick={() => startLogging(undefined)}>
              <Plus className="size-5" aria-hidden="true" />{copy.log.other}
            </Button>
          </>
        )}
      </TabsContent>
      <TabsContent value="past"><WorkoutHistoryPanel /></TabsContent>
      <TabsContent value="plan" className="flex flex-col gap-4">
        <WeeklyWorkoutSchedule sessions={plan.sessions} />
        <Disclosure summary={copy.swap.title}>
          {customization ? (
            <WorkoutPlanExerciseEditor defaultPlan={customization.defaultPlan} options={customization.options} selections={selections}
              saving={saving} saved={saved} error={error}
              onSelect={(sessionIndex, slotIndex, exerciseId) => {
                setSaved(false);
                setSelections((current) => current.map((session, index) => (index === sessionIndex
                  ? session.map((id, slot) => (slot === slotIndex ? exerciseId : id))
                  : session)));
              }}
              onSave={() => void saveCustomization()}
              onReset={() => {
                setSelections(getSelections(defaultPlan));
                void saveCustomization(true);
              }} />
          ) : <p className="text-base text-muted-foreground">{loading ? copy.loadingChoices : copy.loadChoicesError}</p>}
        </Disclosure>
        <section aria-labelledby="change-goal" className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5">
          <h2 id="change-goal" className="text-xl font-semibold">{copy.changeGoal.title}</h2>
          <Button asChild variant="outline"><Link href="/dashboard/profile">{copy.changeGoal.action}</Link></Button>
        </section>
      </TabsContent>
    </Tabs>
  );
};
