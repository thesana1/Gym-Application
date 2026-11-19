'use client';

import { CircleCheck, Flame, Medal, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import type { PersonalExerciseRecord } from '@/features/fitness/service/personal-record.service';
import { progressionText } from '@/features/training/components/session-exercise-card';
import { WeekRope } from '@/features/training/components/week-rope';
import { useTrainingPlan } from '@/features/training/hooks/use-training-plan';
import type { WorkoutSession } from '@/features/training/service/training-plan.service';
import { suggestNextTarget, type SetResult } from '@/features/training/service/training-progression.service';
import { summarizeWeek } from '@/features/training/service/training-week.service';
import { Button } from '@/shared/components/ui/button';
import { Field } from '@/shared/components/ui/field';
import { AI_DISCLAIMERS, AI_ERROR_MESSAGES } from '@/shared/const/ai.const';
import { TRAINING_COPY } from '@/shared/const/copy-training.const';
import { http } from '@/shared/lib/http';

export type FinishedExercise = { exercise: WorkoutSession['exercises'][number]; sets: SetResult[] };
type WorkoutFinishProps = { workoutName: string; result: FinishedExercise[]; minutes: number; records: PersonalExerciseRecord[] };

const copy = TRAINING_COPY.finish;
const heaviest = (sets: SetResult[]) => Math.max(0, ...sets.map((set) => set.weightKg ?? 0));

export const WorkoutFinish = ({ workoutName, result, minutes, records }: WorkoutFinishProps) => {
  const { plan, logs, loading } = useTrainingPlan();
  const [tip, setTip] = useState<string | null>(null);
  const [tipState, setTipState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [tipError, setTipError] = useState<string | null>(null);

  const lifted = result.reduce((sum, { sets }) => sum + sets.reduce((total, set) => total + set.repetitions * (set.weightKg ?? 0), 0), 0);
  const setCount = result.reduce((sum, { sets }) => sum + sets.length, 0);
  const reps = result.reduce((sum, { sets }) => sum + sets.reduce((total, set) => total + set.repetitions, 0), 0);
  const next = result.map(({ exercise, sets }) => ({
    exercise, target: suggestNextTarget(exercise, exercise.definition.region, [sets, exercise.target.lastSets]),
  }));
  const bests = result.flatMap(({ exercise, sets }) => {
    const before = records.find(({ exerciseId }) => exerciseId === exercise.exerciseId)?.heaviestSet?.weightKg;
    const now = heaviest(sets);
    const top = sets.find((set) => set.weightKg === now);
    return before !== undefined && now > before && top ? [copy.best(exercise.definition.name, now, top.repetitions)] : [];
  });
  const stats = [lifted > 0 ? [Math.round(lifted).toLocaleString(), copy.lifted] : [String(reps), copy.reps],
    [String(setCount), copy.sets], [String(minutes), copy.minutes]];
  const week = plan && !loading ? summarizeWeek(plan, logs, new Date(), plan.createdAt) : null;

  const askTip = async () => {
    setTipState('loading');
    try {
      const response = await http.post<{ tip: string }>('/training/tip', {
        workoutName, exercises: next.map(({ exercise, target }) => ({
          name: exercise.definition.name, sets: result.find((item) => item.exercise === exercise)?.sets ?? [], nextChange: target.change,
        })),
      });
      setTip(response.tip);
      setTipState('idle');
    } catch (error) {
      setTipError(AI_ERROR_MESSAGES[error instanceof Error ? error.message : ''] ?? AI_ERROR_MESSAGES.AI_UNAVAILABLE);
      setTipState('error');
    }
  };

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Field tone="pool" role="status" className="gap-6 py-8">
        <span className="relative flex size-16 items-center justify-center rounded-full bg-pool-foreground text-pool">
          <span aria-hidden="true" className="absolute inset-0 animate-ripple rounded-full bg-pool-foreground" />
          <CircleCheck className="size-10 animate-pop" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="text-5xl leading-none">{copy.title}</h1>
          <p className="text-lg font-medium">{copy.subtitle(workoutName)}</p>
        </div>
        <dl className="grid grid-cols-3 divide-x divide-pool-foreground/25 border-t border-pool-foreground/25 pt-4">
          {stats.map(([value, label]) => (
            <div key={label} className="flex flex-col px-3 first:pl-0">
              <dt className="sr-only">{label}</dt>
              <dd className="font-heading text-4xl font-extrabold tracking-display font-stretch-condensed">{value}</dd>
              <dd className="text-base">{label}</dd>
            </div>
          ))}
        </dl>
      </Field>

      {bests.length > 0 && (
        <section aria-labelledby="new-bests" className="animate-rise rounded-lg border-2 border-primary bg-card p-5">
          <h2 id="new-bests" className="flex items-center gap-2 text-2xl">
            <Medal className="size-6 animate-pop text-primary-ink" aria-hidden="true" />{copy.newBests}
          </h2>
          <ul className="mt-2 flex flex-col gap-1 text-lg">{bests.map((line) => <li key={line}>{line}</li>)}</ul>
        </section>
      )}

      {week && week.planned > 0 && (
        <section aria-label={copy.weekProgress(week.done, week.planned)} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-heading text-xl font-extrabold">{copy.weekProgress(week.done, week.planned)}</p>
            {week.streakWeeks > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1 text-base font-bold text-background">
                <Flame className="size-4 text-primary" aria-hidden="true" />{TRAINING_COPY.week.streak(week.streakWeeks)}</span>
            )}
          </div>
          <WeekRope days={week.days} />
        </section>
      )}

      <section aria-labelledby="next-time" className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
        <h2 id="next-time" className="text-2xl">{copy.nextTime}</h2>
        <ul className="flex flex-col gap-3">
          {next.map(({ exercise, target }) => (
            <li key={exercise.exerciseId}>
              <p className="text-base font-semibold">{exercise.definition.name}</p>
              <p className="text-base text-muted-foreground">
                {progressionText(target, exercise.definition.equipment.every((item) => item === 'bodyweight'))}
              </p>
            </li>
          ))}
        </ul>
        {tip ? (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-lg">{tip}</p>
            <p className="mt-2 text-base text-muted-foreground">{AI_DISCLAIMERS.training}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <Button variant="ghost" disabled={tipState === 'loading'} onClick={() => void askTip()}>
              <Sparkles className="size-5" aria-hidden="true" />{tipState === 'loading' ? copy.tipLoading : copy.tipButton}
            </Button>
            <p className="text-center text-base text-muted-foreground">{copy.tipNote}</p>
            {tipError && <p role="alert" className="text-base text-destructive">{tipError}</p>}
          </div>
        )}
      </section>
      <Button asChild size="lg"><Link href="/dashboard/workouts">{copy.backHome}</Link></Button>
    </div>
  );
};
