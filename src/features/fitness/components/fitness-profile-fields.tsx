import { type ReactNode } from 'react';
import { useController, type Control } from 'react-hook-form';

import type { FitnessProfileInput, FitnessProfileType } from '@/features/fitness/validations/fitness-profile.validation';
import { OptionCard } from '@/shared/components/ui/option-card';
import { PROFILE_COPY } from '@/shared/const/copy-account.const';
import { FITNESS_GOALS, TRAINING_EXPERIENCE_LEVELS } from '@/shared/const/fitness.const';

export type ProfileControl = Control<FitnessProfileInput, undefined, FitnessProfileType>;

export const StepShell = ({ title, help, error, children }: { title: string; help: string; error?: string; children: ReactNode }) => (
  <fieldset className="flex flex-col gap-3">
    <legend className="mb-1 text-balance font-heading text-2xl font-semibold">{title}</legend>
    <p className="text-lg text-muted-foreground">{help}</p>
    {children}
    {error && <p role="alert" className="text-base text-destructive">{error}</p>}
  </fieldset>
);

export const GoalStep = ({ control }: { control: ProfileControl }) => {
  const { field, fieldState } = useController({ control, name: 'goal' });
  return (
    <StepShell title={PROFILE_COPY.steps.goal.title} help={PROFILE_COPY.steps.goal.help} error={fieldState.error && PROFILE_COPY.errors.goal}>
      {FITNESS_GOALS.map(({ value, label }) => (
        <OptionCard key={value} type="radio" name="goal" label={label} checked={field.value === value} onChange={() => field.onChange(value)} />
      ))}
    </StepShell>
  );
};

export const ExperienceStep = ({ control }: { control: ProfileControl }) => {
  const { field, fieldState } = useController({ control, name: 'experience' });
  return (
    <StepShell title={PROFILE_COPY.steps.experience.title} help={PROFILE_COPY.steps.experience.help}
      error={fieldState.error && PROFILE_COPY.errors.experience}>
      {TRAINING_EXPERIENCE_LEVELS.map(({ value, label }) => (
        <OptionCard key={value} type="radio" name="experience" label={label} help={PROFILE_COPY.experienceHelp[value]}
          checked={field.value === value} onChange={() => field.onChange(value)} />
      ))}
    </StepShell>
  );
};
