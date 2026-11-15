'use client';

import { Play, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import type { WorkoutPlan, WorkoutSession } from '@/features/fitness/service/workout-plan.service';
import { Button } from '@/shared/components/ui/button';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { WORKOUTS_COPY } from '@/shared/const/copy-workouts.const';
import { cn } from '@/shared/lib/utils';

type WorkoutPlanViewProps = {
  plan: WorkoutPlan | null;
  initialSessionIndex?: number;
  onLogSession?: (index: number) => void;
};

const copy = WORKOUTS_COPY.view;

const ExerciseDetails = ({ exercise }: { exercise: WorkoutSession['exercises'][number] }) => (
  <li className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0">
    <div>
      <h3 className="text-xl font-semibold">{exercise.name}</h3>
      <p className="mt-1 text-lg font-medium tabular-nums">
        {copy.setsReps(exercise.sets, exercise.repetitions)}
        <span className="text-muted-foreground"> · {copy.rest(exercise.restSeconds)}</span>
      </p>
      <p className="mt-1 text-base text-muted-foreground">{copy.works(exercise.targetMuscles)}</p>
    </div>
    <Disclosure summary={copy.howTo} className="bg-background">
      <ol className="list-decimal space-y-2 pl-5 text-base">
        {exercise.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}
      </ol>
      <dl className="mt-4 grid gap-3 text-base">
        <div>
          <dt className="font-semibold">{copy.easier}</dt>
          <dd className="text-muted-foreground">{exercise.regression}</dd>
        </div>
        <div>
          <dt className="font-semibold">{copy.mistake}</dt>
          <dd className="text-muted-foreground">{exercise.commonMistake}</dd>
        </div>
        <div>
          <dt className="font-semibold">{copy.safe}</dt>
          <dd className="text-muted-foreground">{exercise.safetyCue}</dd>
        </div>
      </dl>
    </Disclosure>
  </li>
);

export const WorkoutPlanView = ({ plan, initialSessionIndex, onLogSession }: WorkoutPlanViewProps) => {
  const [sessionIndex, setSessionIndex] = useState(
    initialSessionIndex !== undefined && plan?.sessions[initialSessionIndex] ? initialSessionIndex : 0
  );
  if (!plan) {
    return (
      <EmptyState message={WORKOUTS_COPY.noPlan.message} action={
        <Button asChild><Link href="/dashboard/profile">{WORKOUTS_COPY.noPlan.action}</Link></Button>
      } />
    );
  }

  const session = plan.sessions[sessionIndex];
  return (
    <div className="flex flex-col gap-5">
      {plan.sessions.length > 1 && (
        <div role="group" aria-label={copy.pickWorkout} className="grid grid-flow-col gap-2">
          {plan.sessions.map((item, index) => (
            <button key={`${item.title}-${index}`} type="button" aria-pressed={index === sessionIndex} onClick={() => setSessionIndex(index)}
              className={cn('min-h-12 rounded-lg border px-2 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring',
                index === sessionIndex ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-accent')}>
              {copy.workoutNumber(index)}
            </button>
          ))}
        </div>
      )}

      <section aria-labelledby="session-title" className="rounded-2xl border border-border bg-card p-5">
        <h2 id="session-title" className="text-2xl font-semibold">{session.title}</h2>
        <p className="mt-2 flex items-center gap-2 text-base text-muted-foreground">
          <TriangleAlert className="size-5 shrink-0" aria-hidden="true" />{copy.safety}
        </p>
        <ul className="mt-5 divide-y divide-border">
          {session.exercises.map((exercise) => <ExerciseDetails key={exercise.id} exercise={exercise} />)}
        </ul>
      </section>

      {onLogSession && (
        <Button size="lg" asChild className="sticky bottom-24 z-10 w-full shadow-lg lg:bottom-6">
          <button type="button" onClick={() => onLogSession(sessionIndex)}><Play className="size-5" aria-hidden="true" />{copy.start}</button>
        </Button>
      )}

      <Disclosure summary={copy.about}>
        <div className="space-y-2 text-base text-muted-foreground">
          <p>{copy.aboutBody(plan.weeklySessionLimit)}</p>
          <p>{copy.equipment(plan.equipmentPersonalized)}</p>
          <p>{copy.notMedical}</p>
        </div>
      </Disclosure>
    </div>
  );
};
