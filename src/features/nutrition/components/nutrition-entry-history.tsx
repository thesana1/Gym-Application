'use client';

import { Pencil, Trash2 } from 'lucide-react';

import type { NutritionEntry } from '@/features/nutrition/service/nutrition.service';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { FOOD_COPY } from '@/shared/const/copy-food.const';

type NutritionEntryHistoryProps = {
  entries: NutritionEntry[];
  loading: boolean;
  onEdit: (entry: NutritionEntry) => void;
  onDelete: (entry: NutritionEntry) => void;
};

const copy = FOOD_COPY.list;

export const NutritionEntryHistory = ({ entries, loading, onEdit, onDelete }: NutritionEntryHistoryProps) => (
  <section aria-labelledby="food-list-title" className="flex flex-col gap-3">
    <h2 id="food-list-title" className="text-xl">{copy.title}</h2>
    {loading ? (
      <div className="h-24 animate-pulse rounded-lg bg-muted" role="status" aria-label={copy.loading} />
    ) : entries.length === 0 ? (
      <EmptyState message={copy.empty} />
    ) : (
      <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
        {entries.map((entry) => (
          <li key={entry.id} className="flex flex-col gap-3 p-4">
            <div>
              <p className="text-base font-medium text-muted-foreground">{FOOD_COPY.meals[entry.mealType]}</p>
              <h3 className="text-lg">{entry.foodName}</h3>
              <p className="text-base tabular-nums text-muted-foreground">{copy.line(entry.calories, entry.proteinGrams)}</p>
              {entry.notes && <p className="mt-1 text-base text-muted-foreground">{entry.notes}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" aria-label={copy.editLabel(entry.foodName)} onClick={() => onEdit(entry)}>
                <Pencil className="size-4" aria-hidden="true" />{copy.edit}
              </Button>
              <Button variant="ghost" size="sm" aria-label={copy.deleteLabel(entry.foodName)} onClick={() => onDelete(entry)}
                className="text-destructive hover:text-destructive">
                <Trash2 className="size-4" aria-hidden="true" />{copy.delete}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
);
