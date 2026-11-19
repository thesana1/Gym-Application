import { Pencil, RefreshCw } from 'lucide-react';

import type { TrainingPlanType } from '@/features/training/validations/training-plan.validation';
import { Button } from '@/shared/components/ui/button';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { TRAINING_COPY } from '@/shared/const/copy-training.const';
import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';

type PlanOverviewProps = { plan: TrainingPlanType; onEdit: () => void; onNew: () => void };

const copy = TRAINING_COPY.editor;
const exerciseName = (id: string) => WORKOUT_EXERCISE_LIBRARY.find((exercise) => exercise.id === id)?.name ?? id;

export const ResearchNote = () => (
  <Disclosure summary={TRAINING_COPY.research.title}>
    <ul className="list-disc space-y-2 pl-5 text-base">{TRAINING_COPY.research.lines.map((line) => <li key={line}>{line}</li>)}</ul>
    <p className="mt-3 text-base text-muted-foreground">{TRAINING_COPY.research.sources}</p>
  </Disclosure>
);

export const PlanOverview = ({ plan, onEdit, onNew }: PlanOverviewProps) => (
  <div className="flex flex-col gap-4">
    <Button size="lg" onClick={onEdit}><Pencil className="size-5" aria-hidden="true" />{copy.edit}</Button>
    <ul className="flex flex-col gap-3">
      {plan.workouts.map((workout) => (
        <li key={workout.id} className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <h2 className="text-xl">{workout.name}</h2>
            <span className="text-base font-semibold text-primary-ink">
              {workout.weekday === null ? copy.noDay : TRAINING_COPY.weekdays[workout.weekday]}
            </span>
          </div>
          <ul className="mt-3 flex flex-col gap-1">
            {workout.exercises.map((exercise) => (
              <li key={exercise.exerciseId} className="flex flex-wrap justify-between gap-x-3 text-base">
                <span>{exerciseName(exercise.exerciseId)}</span>
                <span className="tabular-nums text-muted-foreground">{copy.summaryLine(exercise.sets, exercise.repMin, exercise.repMax)}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
    <ResearchNote />
    <Button variant="ghost" onClick={onNew}><RefreshCw className="size-5" aria-hidden="true" />{copy.startOver}</Button>
  </div>
);
