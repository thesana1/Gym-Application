'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  NutritionEntryInput,
  NutritionEntrySchema,
  NutritionEntryType,
} from '@/features/nutrition/validations/nutrition.validation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

const EMPTY_ENTRY: NutritionEntryInput = {
  date: '',
  mealType: 'breakfast',
  foodName: '',
  calories: '',
  proteinGrams: '',
  carbohydrateGrams: '',
  fatGrams: '',
  fiberGrams: '',
  waterMl: '',
  notes: '',
};

type NutritionEntryFormProps = {
  date: string;
  saving: boolean;
  initialValues?: NutritionEntryInput;
  onCancel?: () => void;
  onSave: (value: NutritionEntryType) => Promise<void>;
};

const MACRO_FIELDS = [
  { name: 'calories', label: 'Calories (kcal)', min: '0', max: '10000' },
  { name: 'proteinGrams', label: 'Protein (g)', min: '0', max: '1000' },
  { name: 'carbohydrateGrams', label: 'Carbohydrates (g)', min: '0', max: '1500' },
  { name: 'fatGrams', label: 'Fat (g)', min: '0', max: '500' },
  { name: 'fiberGrams', label: 'Fiber (g)', min: '0', max: '200' },
  { name: 'waterMl', label: 'Water (ml, optional)', min: '0', max: '10000' },
] as const;

export const NutritionEntryForm = ({
  date,
  saving,
  initialValues,
  onCancel,
  onSave,
}: NutritionEntryFormProps) => {
  const form = useForm<NutritionEntryInput, undefined, NutritionEntryType>({
    resolver: zodResolver(NutritionEntrySchema),
    defaultValues: initialValues ?? { ...EMPTY_ENTRY, date },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(onSave)}
    >
      <label className="grid gap-2 text-sm font-medium">
        Food or meal
        <Input maxLength={120} {...form.register('foodName')} />
        {form.formState.errors.foodName && (
          <span className="text-xs text-destructive">
            {form.formState.errors.foodName.message}
          </span>
        )}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Meal
          <select
            {...form.register('mealType')}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Date
          <Input type="date" {...form.register('date')} />
          {form.formState.errors.date && (
            <span className="text-xs text-destructive">
              {form.formState.errors.date.message}
            </span>
          )}
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MACRO_FIELDS.map(({ name, label, min, max }) => (
          <label key={name} className="grid gap-2 text-sm font-medium">
            {label}
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
      </div>

      <label className="grid gap-2 text-sm font-medium">
        Notes (optional)
        <textarea
          maxLength={500}
          rows={2}
          {...form.register('notes')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </label>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save food entry'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
