'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
  NutritionTargetsInput,
  NutritionTargetsSchema,
  NutritionTargetsType,
} from '@/features/nutrition/validations/nutrition.validation';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';

const TARGET_FIELDS = [
  { name: 'calories', label: 'Calories', unit: 'kcal', min: '500', max: '10000' },
  { name: 'proteinGrams', label: 'Protein', unit: 'g', min: '0', max: '1000' },
  { name: 'carbohydrateGrams', label: 'Carbohydrates', unit: 'g', min: '0', max: '1500' },
  { name: 'fatGrams', label: 'Fat', unit: 'g', min: '0', max: '500' },
  { name: 'fiberGrams', label: 'Fiber', unit: 'g', min: '0', max: '200' },
  { name: 'waterMl', label: 'Water', unit: 'ml', min: '0', max: '10000' },
] as const;

const EMPTY_TARGETS: NutritionTargetsInput = {
  calories: '',
  proteinGrams: '',
  carbohydrateGrams: '',
  fatGrams: '',
  fiberGrams: '',
  waterMl: '',
};

type NutritionTargetFormProps = {
  targets: NutritionTargetsType | null;
  saving: boolean;
  onSave: (value: NutritionTargetsType) => Promise<boolean>;
};

export const NutritionTargetForm = ({
  targets,
  saving,
  onSave,
}: NutritionTargetFormProps) => {
  const form = useForm<NutritionTargetsInput, undefined, NutritionTargetsType>({
    resolver: zodResolver(NutritionTargetsSchema),
    defaultValues: targets ?? EMPTY_TARGETS,
  });

  useEffect(() => {
    if (targets) form.reset(targets);
  }, [form, targets]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your daily targets</CardTitle>
        <CardDescription>
          These are targets you choose or have discussed with a qualified
          professional. They are not automatically calculated or medical advice.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={form.handleSubmit(async (value) => {
            if (await onSave(value)) form.reset(value);
          })}
        >
          {TARGET_FIELDS.map(({ name, label, unit, min, max }) => (
            <label key={name} className="grid gap-2 text-sm font-medium">
              {label} ({unit})
              <Input
                type="number"
                min={min}
                max={max}
                step="any"
                {...form.register(name)}
                aria-invalid={Boolean(form.formState.errors[name])}
              />
              {form.formState.errors[name]?.message && (
                <span className="text-xs text-destructive">
                  {form.formState.errors[name]?.message}
                </span>
              )}
            </label>
          ))}
          <div className="sm:col-span-2 lg:col-span-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving targets...' : 'Save targets'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
