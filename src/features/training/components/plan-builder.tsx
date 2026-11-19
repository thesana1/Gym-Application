'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useController, useForm, type Control } from 'react-hook-form';

import { PlanPrioritiesSchema, type PlanPrioritiesType } from '@/features/training/validations/training-plan.validation';
import { Button } from '@/shared/components/ui/button';
import { OptionCard } from '@/shared/components/ui/option-card';
import { TRAINING_COPY } from '@/shared/const/copy-training.const';
import { FITNESS_GOALS } from '@/shared/const/fitness.const';
import { FOCUS_AREAS } from '@/shared/const/training.const';
import { cn } from '@/shared/lib/utils';

type PlanBuilderProps = {
  defaults: PlanPrioritiesType;
  busy: boolean;
  onSuggest: (priorities: PlanPrioritiesType) => void;
  onManual: (priorities: PlanPrioritiesType) => void;
};

const copy = TRAINING_COPY.builder;
const STEPS = ['goal', 'focusAreas', 'weekdays'] as const;
const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0];

const Step = ({ title, help, children, error }: { title: string; help?: string; children: ReactNode; error?: string }) => (
  <fieldset className="flex flex-col gap-3">
    <legend className="mb-1 text-balance font-heading text-2xl font-extrabold">{title}</legend>
    {help && <p className="text-lg text-muted-foreground">{help}</p>}
    {children}
    {error && <p role="alert" className="text-base text-destructive">{error}</p>}
  </fieldset>
);

const DayPicker = ({ control }: { control: Control<PlanPrioritiesType> }) => {
  const { field, fieldState } = useController({ control, name: 'weekdays' });
  return (
    <Step title={copy.daysTitle} help={copy.daysHelp} error={fieldState.error?.message ?? fieldState.error?.root?.message}>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {MONDAY_FIRST.map((day) => {
          const checked = field.value.includes(day);
          return (
            <label key={day} className={cn('flex min-h-14 cursor-pointer items-center justify-center rounded-lg border-2 text-base font-semibold',
              'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring',
              checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-accent')}>
              <input type="checkbox" className="sr-only" checked={checked}
                onChange={() => field.onChange(checked ? field.value.filter((item) => item !== day) : [...field.value, day])} />
              {TRAINING_COPY.weekdaysShort[day]}
            </label>
          );
        })}
      </div>
    </Step>
  );
};

export const PlanBuilder = ({ defaults, busy, onSuggest, onManual }: PlanBuilderProps) => {
  const [step, setStep] = useState(0);
  const form = useForm<PlanPrioritiesType>({ resolver: zodResolver(PlanPrioritiesSchema), defaultValues: defaults });
  const goal = useController({ control: form.control, name: 'goal' }).field;
  const focus = useController({ control: form.control, name: 'focusAreas' }).field;
  const isLast = step === STEPS.length - 1;

  const next = async () => {
    if (await form.trigger(STEPS[step])) setStep((current) => current + 1);
  };

  return (
    <form noValidate onSubmit={form.handleSubmit(onSuggest)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-base font-semibold text-muted-foreground">{copy.stepOf(step + 1, STEPS.length)}</p>
        <div className="grid grid-cols-3 gap-1" aria-hidden="true">
          {STEPS.map((name, index) => <span key={name} className={cn('h-2 rounded-full', index <= step ? 'bg-primary' : 'bg-muted')} />)}
        </div>
      </div>
      {step === 0 && (
        <Step title={copy.goalTitle}>
          {FITNESS_GOALS.map(({ value, label }) => (
            <OptionCard key={value} type="radio" name="goal" label={label} checked={goal.value === value} onChange={() => goal.onChange(value)} />
          ))}
        </Step>
      )}
      {step === 1 && (
        <Step title={copy.focusTitle} help={copy.focusHelp}>
          <div className="grid grid-cols-2 gap-2">
            {FOCUS_AREAS.map(({ value, label }) => {
              const checked = focus.value.includes(value);
              return (
                <OptionCard key={value} type="checkbox" name="focusAreas" label={label} checked={checked}
                  onChange={() => focus.onChange(checked ? focus.value.filter((item) => item !== value) : [...focus.value, value])} />
              );
            })}
          </div>
        </Step>
      )}
      {step === 2 && <DayPicker control={form.control} />}

      {busy && <p role="status" className="rounded-lg border border-border bg-card p-4 text-base">{copy.suggesting}</p>}
      <div className="sticky bottom-24 z-10 flex flex-col gap-2 bg-background/95 py-2 lg:bottom-0">
        <div className="flex gap-3">
          {step > 0 && (
            <Button type="button" size="lg" variant="outline" onClick={() => setStep((current) => current - 1)}>
              <ArrowLeft className="size-5" aria-hidden="true" />{copy.back}
            </Button>
          )}
          {isLast ? (
            <Button key="suggest" type="submit" size="lg" className="flex-1" disabled={busy}>
              <Sparkles className="size-5" aria-hidden="true" />{copy.suggest}
            </Button>
          ) : (
            <Button key="next" type="button" size="lg" className="flex-1" onClick={() => void next()}>
              {copy.next}<ArrowRight className="size-5" aria-hidden="true" />
            </Button>
          )}
        </div>
        {isLast && (
          <Button type="button" variant="ghost" disabled={busy} onClick={form.handleSubmit(onManual)}>{copy.manual}</Button>
        )}
      </div>
    </form>
  );
};
