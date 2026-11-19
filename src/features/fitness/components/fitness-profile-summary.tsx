import { Pencil } from 'lucide-react';

import type { FitnessProfileInput } from '@/features/fitness/validations/fitness-profile.validation';
import { Button } from '@/shared/components/ui/button';
import { PROFILE_COPY } from '@/shared/const/copy-account.const';
import { AVAILABLE_EQUIPMENT, FITNESS_GOALS, PROFILE_MEASUREMENT_FIELDS, TRAINING_EXPERIENCE_LEVELS } from '@/shared/const/fitness.const';

export const PROFILE_STEPS = ['goal', 'experience', 'days', 'equipment', 'body'] as const;
export type ProfileStep = (typeof PROFILE_STEPS)[number];

type FitnessProfileSummaryProps = {
  values: FitnessProfileInput;
  onChange: (step: ProfileStep) => void;
};

const copy = PROFILE_COPY;

const describe = (values: FitnessProfileInput): Record<ProfileStep, string> => ({
  goal: FITNESS_GOALS.find(({ value }) => value === values.goal)?.label ?? copy.notSet,
  experience: TRAINING_EXPERIENCE_LEVELS.find(({ value }) => value === values.experience)?.label ?? copy.notSet,
  days: values.trainingDaysPerWeek ? copy.summary.daysValue(Number(values.trainingDaysPerWeek)) : copy.notSet,
  equipment: values.availableEquipment.length
    ? values.availableEquipment.map((item) => AVAILABLE_EQUIPMENT.find(({ value }) => value === item)?.label ?? item).join(', ')
    : copy.bodyweightOnly,
  body: PROFILE_MEASUREMENT_FIELDS.filter(({ name }) => values[name] !== '' && values[name] !== undefined)
    .map(({ name }) => `${copy.body[name]}: ${values[name]}`).join(' · ') || copy.notSet,
});

export const FitnessProfileSummary = ({ values, onChange }: FitnessProfileSummaryProps) => {
  const text = describe(values);
  return (
    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
      {PROFILE_STEPS.map((step) => (
        <li key={step} className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-base text-muted-foreground">{copy.summary[step]}</p>
            <p className="break-words text-lg font-semibold">{text[step]}</p>
          </div>
          <Button variant="outline" size="sm" aria-label={copy.changeLabel(copy.summary[step])} onClick={() => onChange(step)}>
            <Pencil className="size-4" aria-hidden="true" />{copy.change}
          </Button>
        </li>
      ))}
    </ul>
  );
};
