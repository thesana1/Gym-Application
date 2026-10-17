'use client';

import { Pencil, Trash2 } from 'lucide-react';

import type { NutritionEntry } from '@/features/nutrition/service/nutrition.service';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

type NutritionEntryHistoryProps = {
  entries: NutritionEntry[];
  loading: boolean;
  onEdit: (entry: NutritionEntry) => void;
  onDelete: (entry: NutritionEntry) => void;
};

const MEAL_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export const NutritionEntryHistory = ({
  entries,
  loading,
  onEdit,
  onDelete,
}: NutritionEntryHistoryProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Food log</CardTitle>
      <CardDescription>
        {entries.length
          ? `${entries.length} entries recorded for this day.`
          : 'Nutrition totals use only the entries you record.'}
      </CardDescription>
    </CardHeader>
    <CardContent>
      {loading ? (
        <p className="text-sm text-muted-foreground" role="status">
          Loading food log...
        </p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No food entries for this date yet. Add a meal or snack to begin
          tracking.
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-md border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{entry.foodName}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {MEAL_LABELS[entry.mealType]}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${entry.foodName}`}
                    onClick={() => onEdit(entry)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${entry.foodName}`}
                    onClick={() => onDelete(entry)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {entry.calories} kcal · {entry.proteinGrams} g protein ·{' '}
                {entry.carbohydrateGrams} g carbs · {entry.fatGrams} g fat ·{' '}
                {entry.fiberGrams} g fiber
                {entry.waterMl ? ` · ${entry.waterMl} ml water` : ''}
              </p>
              {entry.notes && (
                <p className="mt-2 text-sm text-muted-foreground">{entry.notes}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);
