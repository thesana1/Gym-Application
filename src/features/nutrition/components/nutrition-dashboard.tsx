'use client';

import { useCallback, useEffect, useState } from 'react';

import { NutritionEntryForm } from '@/features/nutrition/components/nutrition-entry-form';
import { NutritionEntryHistory } from '@/features/nutrition/components/nutrition-entry-history';
import { NutritionSummary } from '@/features/nutrition/components/nutrition-summary';
import { NutritionTargetForm } from '@/features/nutrition/components/nutrition-target-form';
import { SevenDayNutritionSummary } from '@/features/nutrition/components/seven-day-nutrition-summary';
import { useNutrition } from '@/features/nutrition/hooks/use-nutrition';
import type {
  NutritionEntry,
  NutritionTargets,
} from '@/features/nutrition/service/nutrition.service';
import type {
  NutritionEntryInput,
  NutritionEntryType,
} from '@/features/nutrition/validations/nutrition.validation';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';

const getToday = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
};

const toEntryInput = (entry: NutritionEntry): NutritionEntryInput => ({
  date: entry.date,
  mealType: entry.mealType,
  foodName: entry.foodName,
  calories: String(entry.calories),
  proteinGrams: String(entry.proteinGrams),
  carbohydrateGrams: String(entry.carbohydrateGrams),
  fatGrams: String(entry.fatGrams),
  fiberGrams: String(entry.fiberGrams),
  waterMl: entry.waterMl === undefined ? '' : String(entry.waterMl),
  notes: entry.notes ?? '',
});

export const NutritionDashboard = () => {
  const {
    targets,
    entries,
    loading,
    saving,
    error,
    loadTargets,
    loadEntries,
    saveTargets,
    saveEntry,
    deleteEntry,
    setError,
  } = useNutrition();
  const [date, setDate] = useState(getToday);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<NutritionEntry | null>(null);

  const refreshEntries = useCallback(() => {
    void loadEntries(date);
  }, [date, loadEntries]);

  useEffect(() => {
    void loadTargets();
  }, [loadTargets]);

  useEffect(() => {
    refreshEntries();
  }, [refreshEntries]);

  const handleSaveEntry = async (value: NutritionEntryType) => {
    if (await saveEntry(editingEntry?.id ?? null, value)) {
      setIsFormOpen(false);
      setEditingEntry(null);
      refreshEntries();
    }
  };

  const handleDeleteEntry = async (entry: NutritionEntry) => {
    if (!window.confirm(`Delete "${entry.foodName}" from your food log?`)) return;
    if (await deleteEntry(entry.id)) refreshEntries();
  };

  const handleSaveTargets = async (value: NutritionTargets) =>
    saveTargets(value);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Eat with awareness
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Nutrition log</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Record meals and compare them with targets you choose.
        </p>
      </header>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <NutritionTargetForm
        targets={targets}
        saving={saving}
        onSave={handleSaveTargets}
      />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="grid gap-2 text-sm font-medium">
          Log date
          <Input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        {!isFormOpen && (
          <Button
            onClick={() => {
              setEditingEntry(null);
              setIsFormOpen(true);
              setError(null);
            }}
          >
            Add food entry
          </Button>
        )}
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingEntry ? 'Edit food entry' : 'Add food entry'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NutritionEntryForm
              key={editingEntry?.id ?? `new-${date}`}
              date={date}
              saving={saving}
              initialValues={editingEntry ? toEntryInput(editingEntry) : undefined}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingEntry(null);
                setError(null);
              }}
              onSave={handleSaveEntry}
            />
          </CardContent>
        </Card>
      )}

      <NutritionSummary entries={entries} targets={targets} />
      <SevenDayNutritionSummary targets={targets} />
      <NutritionEntryHistory
        entries={entries}
        loading={loading}
        onEdit={(entry) => {
          setEditingEntry(entry);
          setIsFormOpen(true);
          setError(null);
        }}
        onDelete={handleDeleteEntry}
      />
    </div>
  );
};
