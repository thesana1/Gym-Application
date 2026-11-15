import { useController } from 'react-hook-form';

import { OptionCard, StepShell, type ProfileControl } from '@/features/fitness/components/fitness-profile-fields';
import { Input } from '@/shared/components/ui/input';
import { PROFILE_COPY } from '@/shared/const/copy-account.const';
import { AVAILABLE_EQUIPMENT, PROFILE_MEASUREMENT_FIELDS } from '@/shared/const/fitness.const';
import { cn } from '@/shared/lib/utils';

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const;

export const DaysStep = ({ control }: { control: ProfileControl }) => {
  const { field, fieldState } = useController({ control, name: 'trainingDaysPerWeek' });
  return (
    <StepShell title={PROFILE_COPY.steps.days.title} help={PROFILE_COPY.steps.days.help} error={fieldState.error?.message}>
      <div role="radiogroup" aria-label={PROFILE_COPY.steps.days.title} className="grid grid-cols-4 gap-2">
        {DAY_OPTIONS.map((days) => {
          const checked = String(field.value) === String(days);
          return (
            <label key={days} className={cn('flex min-h-14 cursor-pointer items-center justify-center rounded-xl border-2 text-xl font-semibold',
              'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring',
              checked ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-accent')}>
              <input type="radio" name="trainingDaysPerWeek" className="sr-only" checked={checked} onChange={() => field.onChange(String(days))} />
              {days}
            </label>
          );
        })}
      </div>
    </StepShell>
  );
};

export const EquipmentStep = ({ control }: { control: ProfileControl }) => {
  const { field, fieldState } = useController({ control, name: 'availableEquipment' });
  return (
    <StepShell title={PROFILE_COPY.steps.equipment.title} help={PROFILE_COPY.steps.equipment.help} error={fieldState.error?.message}>
      {AVAILABLE_EQUIPMENT.map(({ value, label }) => {
        const checked = field.value.includes(value);
        return (
          <OptionCard key={value} type="checkbox" name="availableEquipment" label={label} checked={checked}
            onChange={() => field.onChange(checked ? field.value.filter((item) => item !== value) : [...field.value, value])} />
        );
      })}
    </StepShell>
  );
};

const BodyField = ({ control, name }: { control: ProfileControl; name: (typeof PROFILE_MEASUREMENT_FIELDS)[number]['name'] }) => {
  const { field, fieldState } = useController({ control, name });
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`profile-${name}`} className="text-lg font-medium">{PROFILE_COPY.body[name]}</label>
      <Input id={`profile-${name}`} type="text" inputMode={name === 'age' ? 'numeric' : 'decimal'} autoComplete="off" className="h-14 text-xl tabular-nums"
        {...field} value={field.value ?? ''} aria-invalid={Boolean(fieldState.error)} />
      {fieldState.error && <span role="alert" className="text-base text-destructive">{fieldState.error.message}</span>}
    </div>
  );
};

export const BodyStep = ({ control }: { control: ProfileControl }) => (
  <StepShell title={PROFILE_COPY.steps.body.title} help={PROFILE_COPY.steps.body.help}>
    {PROFILE_MEASUREMENT_FIELDS.map(({ name }) => <BodyField key={name} control={control} name={name} />)}
  </StepShell>
);
