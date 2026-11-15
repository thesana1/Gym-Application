import { type ReactNode } from 'react';
import { useController, type Control } from 'react-hook-form';

import type { FitnessProfileInput, FitnessProfileType } from '@/features/fitness/validations/fitness-profile.validation';
import { PROFILE_COPY } from '@/shared/const/copy-account.const';
import { FITNESS_GOALS, TRAINING_EXPERIENCE_LEVELS } from '@/shared/const/fitness.const';
import { cn } from '@/shared/lib/utils';

export type ProfileControl = Control<FitnessProfileInput, undefined, FitnessProfileType>;

type OptionCardProps = {
  type: 'radio' | 'checkbox';
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  help?: string;
};

// A big tappable choice: the whole card is the label for a hidden native input.
export const OptionCard = ({ type, name, checked, onChange, label, help }: OptionCardProps) => (
  <label className={cn('flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-colors',
    'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring',
    checked ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-accent')}>
    <input type={type} name={name} checked={checked} onChange={onChange} className="size-5 shrink-0" />
    <span className="flex flex-col">
      <span className="text-lg font-semibold">{label}</span>
      {help && <span className="text-base text-muted-foreground">{help}</span>}
    </span>
  </label>
);

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
