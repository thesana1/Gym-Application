'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { NutritionTargetsInput, NutritionTargetsSchema, NutritionTargetsType } from '@/features/nutrition/validations/nutrition.validation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { FOOD_COPY } from '@/shared/const/copy-food.const';

const copy = FOOD_COPY.goals;
const TARGET_FIELDS = [
  { name: 'calories', label: copy.calories },
  { name: 'proteinGrams', label: copy.protein },
  { name: 'carbohydrateGrams', label: copy.carbs },
  { name: 'fatGrams', label: copy.fat },
  { name: 'fiberGrams', label: copy.fiber },
  { name: 'waterMl', label: copy.water },
] as const;

const EMPTY_TARGETS: NutritionTargetsInput = { calories: '', proteinGrams: '', carbohydrateGrams: '', fatGrams: '', fiberGrams: '', waterMl: '' };

type NutritionTargetFormProps = {
  targets: NutritionTargetsType | null;
  saving: boolean;
  onSave: (value: NutritionTargetsType) => Promise<boolean>;
};

export const NutritionTargetForm = ({ targets, saving, onSave }: NutritionTargetFormProps) => {
  const [saved, setSaved] = useState(false);
  const form = useForm<NutritionTargetsInput, undefined, NutritionTargetsType>({
    resolver: zodResolver(NutritionTargetsSchema),
    defaultValues: targets ?? EMPTY_TARGETS,
  });

  useEffect(() => {
    if (targets) form.reset(targets);
  }, [form, targets]);

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={form.handleSubmit(async (value) => {
      setSaved(false);
      if (await onSave(value)) {
        form.reset(value);
        setSaved(true);
      }
    })}>
      <p className="text-base text-muted-foreground">{copy.description}</p>
      <div className="grid grid-cols-2 gap-3">
        {TARGET_FIELDS.map(({ name, label }) => (
          <label key={name} className="flex flex-col gap-2 text-base font-medium">
            {label}
            <Input type="text" inputMode="decimal" autoComplete="off" className="text-lg tabular-nums" {...form.register(name)}
              aria-invalid={Boolean(form.formState.errors[name])} />
            {form.formState.errors[name]?.message && (
              <span role="alert" className="text-base text-destructive">{form.formState.errors[name]?.message}</span>
            )}
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving}>{saving ? copy.saving : copy.save}</Button>
        {saved && <p role="status" className="text-base font-medium text-primary">{copy.saved}</p>}
      </div>
    </form>
  );
};
