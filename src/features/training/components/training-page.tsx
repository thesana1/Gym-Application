'use client';

import { CircleCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { WorkoutHistoryPanel } from '@/features/fitness/components/workout-history-panel';
import type { FitnessProfile } from '@/features/fitness/service/fitness-profile.service';
import { PlanBuilder } from '@/features/training/components/plan-builder';
import { PlanEditor } from '@/features/training/components/plan-editor';
import { PlanOverview } from '@/features/training/components/plan-overview';
import { WeekView } from '@/features/training/components/week-view';
import { trainingErrorMessage, useTrainingPlan } from '@/features/training/hooks/use-training-plan';
import type { PlanSuggestion } from '@/features/training/service/training-ai.service';
import type { PlanPrioritiesType, TrainingPlanType } from '@/features/training/validations/training-plan.validation';
import { PageHeader } from '@/shared/components/layout/page-header';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { AI_ERROR_MESSAGES } from '@/shared/const/ai.const';
import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { TRAINING_COPY } from '@/shared/const/copy-training.const';
import { DEFAULT_WEEKDAYS } from '@/shared/const/training.const';

type TrainingPageProps = { profile: FitnessProfile | null; initialTab?: 'week' | 'plan' | 'history' };
type Mode = { kind: 'view' } | { kind: 'build' } | { kind: 'edit'; draft: TrainingPlanType; suggestion?: Omit<PlanSuggestion, 'plan'> };

const copy = TRAINING_COPY;

const manualPlan = (priorities: PlanPrioritiesType): TrainingPlanType => ({
  goal: priorities.goal, focusAreas: priorities.focusAreas, source: 'manual',
  workouts: priorities.weekdays.map((weekday, index) => ({ id: `w${index + 1}`, name: copy.editor.newWorkoutName(index + 1), weekday, exercises: [] })),
});

const toDraft = ({ goal, focusAreas, source, workouts }: TrainingPlanType): TrainingPlanType => ({ goal, focusAreas, source, workouts });

const SuggestionNote = ({ suggestion }: { suggestion?: Omit<PlanSuggestion, 'plan'> }) => {
  if (!suggestion) return null;
  const fromAi = suggestion.source !== 'library';
  return (
    <section className="flex flex-col gap-2 rounded-2xl bg-primary/10 p-4" role="status">
      <h2 className="text-xl font-semibold">{fromAi ? copy.suggestion.aiTitle : copy.suggestion.libraryTitle}</h2>
      {suggestion.summary && <p className="text-base">{suggestion.summary}</p>}
      {!fromAi && <p className="text-base">{AI_ERROR_MESSAGES[suggestion.notice ?? ''] ?? copy.suggestion.fallback}</p>}
      {suggestion.source === 'saved' && <p className="text-base text-muted-foreground">{copy.suggestion.savedNote}</p>}
      <p className="text-base font-medium">{copy.suggestion.editHelp}</p>
    </section>
  );
};

export const TrainingPage = ({ profile, initialTab = 'week' }: TrainingPageProps) => {
  const { plan, logs, loading, error, load, save, suggest } = useTrainingPlan();
  const [mode, setMode] = useState<Mode>({ kind: 'view' });
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState(false);

  if (!profile) {
    return (
      <EmptyState message={copy.needProfile} action={<Button asChild><Link href="/dashboard/profile">{copy.needProfileAction}</Link></Button>} />
    );
  }
  if (loading) return <div className="h-72 animate-pulse rounded-2xl bg-muted" role="status" aria-label={copy.loading} />;
  if (error) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p className="text-base text-destructive">{error}</p>
        <Button variant="outline" onClick={() => void load()}>{COMMON_COPY.tryAgain}</Button>
      </div>
    );
  }

  const runSuggest = async (priorities: PlanPrioritiesType) => {
    setBusy(true);
    setActionError(null);
    try {
      const { plan: draft, ...suggestion } = await suggest(priorities);
      setMode({ kind: 'edit', draft, suggestion });
      window.scrollTo({ top: 0 });
    } catch (suggestError) {
      setActionError(trainingErrorMessage(suggestError));
    } finally {
      setBusy(false);
    }
  };

  const runSave = async (next: TrainingPlanType) => {
    setBusy(true);
    setActionError(null);
    try {
      await save(next);
      setMode({ kind: 'view' });
      setSavedNote(true);
      window.scrollTo({ top: 0 });
    } catch {
      setActionError(copy.editor.saveFailed);
    } finally {
      setBusy(false);
    }
  };

  const days = profile.trainingDaysPerWeek ?? 3;
  const defaults: PlanPrioritiesType = {
    goal: plan?.goal ?? profile.goal, focusAreas: plan?.focusAreas ?? [], weekdays: DEFAULT_WEEKDAYS[Math.min(Math.max(days, 1), 6)],
  };

  if (mode.kind === 'edit') {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title={copy.editor.edit} className="mb-1" />
        <SuggestionNote suggestion={mode.suggestion} />
        <PlanEditor draft={mode.draft} experience={profile.experience} equipment={profile.availableEquipment} saving={busy} error={actionError}
          onSave={(value) => void runSave(value)} onCancel={() => { setActionError(null); setMode(plan ? { kind: 'view' } : { kind: 'build' }); }} />
      </div>
    );
  }

  if (!plan || mode.kind === 'build') {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title={copy.builder.title} description={copy.builder.help} className="mb-1" />
        {actionError && <p role="alert" className="text-base text-destructive">{actionError}</p>}
        <PlanBuilder defaults={defaults} busy={busy} onSuggest={(value) => void runSuggest(value)}
          onManual={(value) => setMode({ kind: 'edit', draft: manualPlan(value) })} />
        {plan && <Button variant="ghost" onClick={() => setMode({ kind: 'view' })}>{copy.editor.cancel}</Button>}
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <PageHeader title={copy.title} description={copy.description} />
      {savedNote && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-xl bg-primary/10 p-4 text-lg font-medium">
          <CircleCheck className="size-6 text-primary" aria-hidden="true" />{copy.editor.saved}
        </p>
      )}
      <Tabs defaultValue={initialTab}>
        <TabsList aria-label={copy.title}>
          <TabsTrigger value="week">{copy.tabs.week}</TabsTrigger>
          <TabsTrigger value="plan">{copy.tabs.plan}</TabsTrigger>
          <TabsTrigger value="history">{copy.tabs.history}</TabsTrigger>
        </TabsList>
        <TabsContent value="week"><WeekView plan={plan} logs={logs} /></TabsContent>
        <TabsContent value="plan">
          <PlanOverview plan={plan} onEdit={() => setMode({ kind: 'edit', draft: toDraft(plan) })}
            onNew={() => { if (window.confirm(copy.editor.confirmStartOver)) setMode({ kind: 'build' }); }} />
        </TabsContent>
        <TabsContent value="history"><WorkoutHistoryPanel /></TabsContent>
      </Tabs>
    </div>
  );
};
