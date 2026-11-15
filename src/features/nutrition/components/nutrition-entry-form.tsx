'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { NutritionEntryInput, NutritionEntrySchema, NutritionEntryType } from '@/features/nutrition/validations/nutrition.validation';
import { Button } from '@/shared/components/ui/button';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { Input } from '@/shared/components/ui/input';
import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { FOOD_COPY } from '@/shared/const/copy-food.const';
import { cn } from '@/shared/lib/utils';

const EMPTY_ENTRY: NutritionEntryInput = {
  date: '', mealType: 'breakfast', foodName: '', calories: '', proteinGrams: '', carbohydrateGrams: '', fatGrams: '', fiberGrams: '', waterMl: '', notes: '',
};

type NutritionEntryFormProps = {
  date: string;
  saving: boolean;
  initialValues?: NutritionEntryInput;
  onCancel?: () => void;
  onSave: (value: NutritionEntryType) => Promise<void>;
};

const copy = FOOD_COPY.form;
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const NUMBER_FIELDS = [
  { name: 'calories', label: copy.calories, wide: true },
  { name: 'proteinGrams', label: copy.protein },
  { name: 'carbohydrateGrams', label: copy.carbs },
  { name: 'fatGrams', label: copy.fat },
  { name: 'fiberGrams', label: copy.fiber },
  { name: 'waterMl', label: copy.water, wide: true },
] as const;

export const NutritionEntryForm = ({ date, saving, initialValues, onCancel, onSave }: NutritionEntryFormProps) => {
  const form = useForm<NutritionEntryInput, undefined, NutritionEntryType>({
    resolver: zodResolver(NutritionEntrySchema),
    defaultValues: initialValues ?? { ...EMPTY_ENTRY, date },
  });
  const { errors } = form.formState;
  const mealType = useWatch({ control: form.control, name: 'mealType' });

  return (
    <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSave)} noValidate>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-base font-medium">{copy.meal}</legend>
        <div className="grid grid-cols-2 gap-2">
          {MEAL_TYPES.map((meal) => (
            <label key={meal} className={cn('flex min-h-12 cursor-pointer items-center justify-center rounded-lg border text-base font-semibold',
              'has-focus-visible:outline-2 has-focus-visible:outline-ring',
              mealType === meal ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-accent')}>
              <input type="radio" value={meal} {...form.register('mealType')} className="sr-only" />
              {FOOD_COPY.meals[meal]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-2 text-base font-medium">
        {copy.name}
        <Input maxLength={120} placeholder={copy.namePlaceholder} {...form.register('foodName')} aria-invalid={Boolean(errors.foodName)} />
        {errors.foodName && <span role="alert" className="text-base text-destructive">{errors.foodName.message}</span>}
      </label>

      <div className="flex flex-col gap-3">
        <p className="text-base text-muted-foreground">{copy.numbersHelp}</p>
        <div className="grid grid-cols-2 gap-3">
          {NUMBER_FIELDS.map((field) => (
            <label key={field.name} className={cn('flex flex-col gap-2 text-base font-medium', 'wide' in field && 'col-span-2')}>
              {field.label}
              <Input type="text" inputMode="decimal" autoComplete="off" className="text-lg tabular-nums" {...form.register(field.name)}
                aria-invalid={Boolean(errors[field.name])} />
              {errors[field.name]?.message && <span role="alert" className="text-base text-destructive">{errors[field.name]?.message}</span>}
            </label>
          ))}
        </div>
      </div>

      <Disclosure summary={copy.notes} defaultOpen={Boolean(initialValues?.notes) || undefined}>
        <label className="flex flex-col gap-2 text-base font-medium">
          {copy.notesLabel}
          <textarea maxLength={500} rows={2} {...form.register('notes')}
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-base font-normal focus-visible:outline-2 focus-visible:outline-ring" />
        </label>
      </Disclosure>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" size="lg" disabled={saving} className="sm:flex-1">{saving ? copy.saving : copy.save}</Button>
        {onCancel && <Button type="button" size="lg" variant="outline" onClick={onCancel}>{COMMON_COPY.cancel}</Button>}
      </div>
    </form>
  );
};
