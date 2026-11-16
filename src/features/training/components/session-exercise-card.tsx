'use client';

import { Check, TrendingDown, TrendingUp } from 'lucide-react';
import { useWatch, type Control, type UseFormRegister } from 'react-hook-form';

import type { WorkoutSession } from '@/features/training/service/training-plan.service';
import type { ExerciseTarget } from '@/features/training/service/training-progression.service';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { Input } from '@/shared/components/ui/input';
import { TRAINING_COPY } from '@/shared/const/copy-training.const';
import { cn } from '@/shared/lib/utils';

export type SessionSet = { reps: string; kg: string; done: boolean };
export type SessionForm = { exercises: { exerciseId: string; sets: SessionSet[] }[] };

type SessionExerciseCardProps = {
  index: number;
  exercise: WorkoutSession['exercises'][number];
  control: Control<SessionForm>;
  register: UseFormRegister<SessionForm>;
  missingReps: number | null;
  onToggle: (setIndex: number) => void;
};

const copy = TRAINING_COPY.session;

export const progressionText = (target: ExerciseTarget, bodyweight = false) => {
  if (target.change === 'up' && target.weightKg) return TRAINING_COPY.progression.up(target.weightKg);
  if (target.change === 'down' && target.weightKg) return TRAINING_COPY.progression.down(target.weightKg);
  if (target.change === 'harder') return TRAINING_COPY.progression.harder;
  if (target.change === 'same') return TRAINING_COPY.progression.same(target.weightKg);
  return bodyweight ? TRAINING_COPY.progression.startBodyweight : TRAINING_COPY.progression.start;
};

const lastSummary = (target: ExerciseTarget) =>
  target.lastSets.map((set) => (set.weightKg ? `${set.repetitions}×${set.weightKg}` : `${set.repetitions}`)).join(', ');

export const SessionExerciseCard = ({ index, exercise, control, register, missingReps, onToggle }: SessionExerciseCardProps) => {
  const sets = useWatch({ control, name: `exercises.${index}.sets` });
  const { definition, target } = exercise;
  const Trend = target.change === 'down' ? TrendingDown : TrendingUp;
  const allDone = sets.every((set) => set.done);

  return (
    <section aria-labelledby={`exercise-${index}`}
      className={cn('flex flex-col gap-4 rounded-2xl border bg-card p-5 transition-colors', allDone ? 'border-primary' : 'border-border')}>
      <div>
        <h2 id={`exercise-${index}`} className="flex items-center gap-2 text-xl font-semibold">
          {allDone && <Check className="size-6 animate-pop text-primary" aria-hidden="true" />}{definition.name}
        </h2>
        <p className="text-lg font-medium tabular-nums">{copy.target(exercise.sets, exercise.repMin, exercise.repMax)}</p>
        <p className="mt-2 flex gap-2 rounded-xl bg-primary/10 p-3 text-base">
          <Trend className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />{progressionText(target)}
        </p>
        {target.lastSets.length > 0 && <p className="mt-2 text-base text-muted-foreground">{TRAINING_COPY.progression.lastTime(lastSummary(target))}</p>}
      </div>

      <div className="grid grid-cols-12 items-center gap-2 text-base font-medium text-muted-foreground" aria-hidden="true">
        <span className="col-span-3" /><span className="col-span-3">{copy.reps}</span><span className="col-span-3">{copy.kg}</span>
      </div>
      {sets.map((set, setIndex) => (
        <div key={setIndex} className={cn('grid grid-cols-12 items-center gap-2 rounded-xl', set.done && 'bg-primary/5')}>
          <span className="col-span-3 text-base font-semibold">{copy.set(setIndex)}</span>
          <Input className="col-span-3 px-1 text-center text-lg tabular-nums" type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="off"
            placeholder={`${exercise.repMin}–${exercise.repMax}`} aria-label={copy.repsLabel(definition.name, setIndex)}
            aria-invalid={missingReps === setIndex} {...register(`exercises.${index}.sets.${setIndex}.reps`)} />
          <Input className="col-span-3 px-1 text-center text-lg tabular-nums" type="text" inputMode="decimal" autoComplete="off"
            aria-label={copy.kgLabel(definition.name, setIndex)} {...register(`exercises.${index}.sets.${setIndex}.kg`)} />
          <button type="button" onClick={() => onToggle(setIndex)} aria-pressed={set.done}
            aria-label={set.done ? copy.undoLabel(definition.name, setIndex) : copy.doneLabel(definition.name, setIndex)}
            className={cn('col-span-3 flex min-h-12 items-center justify-center gap-1 rounded-lg border-2 text-base font-semibold transition-colors',
              'focus-visible:outline-2 focus-visible:outline-ring',
              set.done ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:border-primary')}>
            {set.done ? <><Check className="size-5 animate-pop" aria-hidden="true" />{copy.done}</> : copy.done}
          </button>
          {missingReps === setIndex && <p role="alert" className="col-span-12 text-base text-destructive">{copy.needReps}</p>}
        </div>
      ))}

      <Disclosure summary={copy.howTo} className="bg-background">
        <ol className="list-decimal space-y-2 pl-5 text-base">{definition.instructions.map((step) => <li key={step}>{step}</li>)}</ol>
        <p className="mt-3 text-base text-muted-foreground">{definition.safetyCue}</p>
      </Disclosure>
    </section>
  );
};
