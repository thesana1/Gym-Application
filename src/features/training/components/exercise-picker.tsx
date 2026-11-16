'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { TRAINING_COPY } from '@/shared/const/copy-training.const';
import { FOCUS_AREAS, type FocusArea } from '@/shared/const/training.const';
import { cn } from '@/shared/lib/utils';
import type { WorkoutExerciseDefinition } from '@/shared/types/workout';

type ExercisePickerProps = {
  options: WorkoutExerciseDefinition[];
  exclude: string[];
  onPick: (exercise: WorkoutExerciseDefinition) => void;
};

const chipClass = (active: boolean) => cn(
  'min-h-11 shrink-0 rounded-full border px-4 text-base font-semibold focus-visible:outline-2 focus-visible:outline-ring',
  active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-accent');

export const ExercisePicker = ({ options, exclude, onPick }: ExercisePickerProps) => {
  const [area, setArea] = useState<FocusArea | null>(null);
  const shown = options.filter((exercise) => !exclude.includes(exercise.id) && (!area || exercise.focus.includes(area)));
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-3">
      <p className="text-base font-semibold">{TRAINING_COPY.editor.pickExercise}</p>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label={TRAINING_COPY.editor.pickExercise}>
        <button type="button" aria-pressed={area === null} className={chipClass(area === null)} onClick={() => setArea(null)}>
          {TRAINING_COPY.editor.allAreas}
        </button>
        {FOCUS_AREAS.map(({ value, label }) => (
          <button key={value} type="button" aria-pressed={area === value} className={chipClass(area === value)} onClick={() => setArea(value)}>
            {label}
          </button>
        ))}
      </div>
      <ul className="flex max-h-80 flex-col divide-y divide-border overflow-y-auto">
        {shown.map((exercise) => (
          <li key={exercise.id}>
            <button type="button" onClick={() => onPick(exercise)}
              className="flex min-h-14 w-full items-center gap-3 px-2 py-2 text-left hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring">
              <Plus className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="flex flex-col">
                <span className="text-base font-semibold">{exercise.name}</span>
                <span className="text-base text-muted-foreground">{exercise.targetMuscles}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
