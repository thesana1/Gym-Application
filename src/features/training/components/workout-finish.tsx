'use client';

import { CircleCheck, Flame, Medal, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import type { PersonalExerciseRecord } from '@/features/fitness/service/personal-record.service';
import { progressionText } from '@/features/training/components/session-exercise-card';
import { useTrainingPlan } from '@/features/training/hooks/use-training-plan';
import type { WorkoutSession } from '@/features/training/service/training-plan.service';
import { suggestNextTarget, type SetResult } from '@/features/training/service/training-progression.service';
import { summarizeWeek } from '@/features/training/service/training-week.service';
import { Button } from '@/shared/components/ui/button';
import { AI_DISCLAIMERS, AI_ERROR_MESSAGES } from '@/shared/const/ai.const';
import { TRAINING_COPY } from '@/shared/const/copy-training.const';
import { http } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';

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
    <div className="flex flex-col gap-4">
      <section className="flex flex-col items-center gap-3 rounded-3xl bg-primary px-5 py-8 text-center text-primary-foreground" role="status">
        <CircleCheck className="size-16 animate-pop" aria-hidden="true" />
        <h1 className="font-heading text-3xl font-semibold">{copy.title}</h1>
        <p className="text-lg text-primary-foreground/90">{workoutName}</p>
        <dl className="mt-2 grid w-full grid-cols-3 gap-2">
          {stats.map(([value, label]) => (
            <div key={label} className="animate-rise rounded-2xl bg-primary-foreground/15 px-2 py-3">
              <dt className="sr-only">{label}</dt>
              <dd className="font-heading text-2xl font-semibold tabular-nums">{value}</dd>
              <dd className="text-base text-primary-foreground/85">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {bests.length > 0 && (
        <section aria-labelledby="new-bests" className="rounded-2xl border-2 border-primary bg-card p-5">
          <h2 id="new-bests" className="flex items-center gap-2 text-xl font-semibold">
            <Medal className="size-6 animate-pop text-primary" aria-hidden="true" />{copy.newBests}
          </h2>
          <ul className="mt-2 flex flex-col gap-1 text-lg">{bests.map((line) => <li key={line}>{line}</li>)}</ul>
        </section>
      )}

      {week && week.planned > 0 && (
        <section aria-label={copy.weekProgress(week.done, week.planned)} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-lg font-semibold">{copy.weekProgress(week.done, week.planned)}</p>
            {week.streakWeeks > 0 && (
              <span className="flex items-center gap-1 text-base font-semibold text-primary"><Flame className="size-4" aria-hidden="true" />
                {TRAINING_COPY.week.streak(week.streakWeeks)}</span>
            )}
          </div>
          <div className="flex gap-1" aria-hidden="true">
            {Array.from({ length: week.planned }, (_, index) => (
              <span key={index} className={cn('h-3 flex-1 rounded-full', index < week.done ? 'bg-primary' : 'bg-muted')} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="next-time" className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
        <h2 id="next-time" className="text-xl font-semibold">{copy.nextTime}</h2>
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
          <div className="rounded-xl bg-primary/10 p-4">
            <p className="text-lg">{tip}</p>
            <p className="mt-2 text-base text-muted-foreground">{AI_DISCLAIMERS.training}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <Button variant="outline" disabled={tipState === 'loading'} onClick={() => void askTip()}>
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
