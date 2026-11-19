'use client';

import { Check, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
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
import { PageHeader } from '@/shared/components/layout/page-header';
import { SectionTabs } from '@/shared/components/layout/section-tabs';
import { Button } from '@/shared/components/ui/button';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { FOOD_COPY } from '@/shared/const/copy-food.const';
import { FOOD_TABS } from '@/shared/const/navigation.const';

const toDateKey = (value: Date) => {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};
const getToday = () => toDateKey(new Date());
const shiftDay = (date: string, days: number) => {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  return toDateKey(next);
};
const formatDay = (date: string) =>
  date === getToday() ? FOOD_COPY.day.today
    : new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`));

const DayPicker = ({ date, onChange }: { date: string; onChange: (date: string) => void }) => (
  <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-1">
    <Button variant="ghost" aria-label={FOOD_COPY.day.backLabel} onClick={() => onChange(shiftDay(date, -1))}>
      <ChevronLeft className="size-5" aria-hidden="true" />{FOOD_COPY.day.back}
    </Button>
    <p className="text-center font-heading text-lg font-extrabold" aria-live="polite">{formatDay(date)}</p>
    <Button variant="ghost" aria-label={FOOD_COPY.day.nextLabel} disabled={date >= getToday()} onClick={() => onChange(shiftDay(date, 1))}>
      {FOOD_COPY.day.next}<ChevronRight className="size-5" aria-hidden="true" />
    </Button>
  </div>
);

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

type NutritionDashboardProps = { startAdding?: boolean };

export const NutritionDashboard = ({ startAdding = false }: NutritionDashboardProps) => {
  const { targets, entries, loading, saving, error, loadTargets, loadEntries, saveTargets, saveEntry, deleteEntry, setError } = useNutrition();
  const [historyVersion, setHistoryVersion] = useState(0);
  const [date, setDate] = useState(getToday);
  const [isFormOpen, setIsFormOpen] = useState(startAdding);
  const [editingEntry, setEditingEntry] = useState<NutritionEntry | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const refreshEntries = useCallback(() => {
    void loadEntries(date);
  }, [date, loadEntries]);

  useEffect(() => {
    void loadTargets();
  }, [loadTargets]);

  useEffect(() => {
    refreshEntries();
  }, [refreshEntries]);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEntry(null);
    setError(null);
  };

  const handleSaveEntry = async (value: NutritionEntryType) => {
    if (await saveEntry(editingEntry?.id ?? null, value)) {
      if (!editingEntry) setAdded(value.foodName);
      closeForm();
      refreshEntries();
      setHistoryVersion((version) => version + 1);
    }
  };

  const handleDeleteEntry = async (entry: NutritionEntry) => {
    if (!window.confirm(FOOD_COPY.list.confirmDelete(entry.foodName))) return;
    if (await deleteEntry(entry.id)) {
      refreshEntries();
      setHistoryVersion((version) => version + 1);
    }
  };

  const handleSaveTargets = async (value: NutritionTargets) => saveTargets(value);

  return (
    <div className="flex max-w-2xl animate-rise flex-col gap-5">
      <PageHeader title={FOOD_COPY.title} description={FOOD_COPY.description} className="mb-1">
        <SectionTabs tabs={FOOD_TABS} />
      </PageHeader>

      {error && <p className="text-base text-destructive" role="alert">{error}</p>}

      {isFormOpen ? (
        <section aria-labelledby="food-form-title" className="rounded-lg border border-border bg-card p-5">
          <h2 id="food-form-title" className="mb-5 text-2xl">{editingEntry ? FOOD_COPY.form.editTitle : FOOD_COPY.form.addTitle}</h2>
          <NutritionEntryForm key={editingEntry?.id ?? `new-${date}`} date={date} saving={saving}
            initialValues={editingEntry ? toEntryInput(editingEntry) : undefined} onCancel={closeForm} onSave={handleSaveEntry} />
        </section>
      ) : (
        <>
          {added && (
            <p role="status" className="flex animate-rise items-center gap-3 rounded-lg bg-pool p-4 text-lg font-bold text-pool-foreground">
              <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-pool-foreground text-pool">
                <span aria-hidden="true" className="absolute inset-0 animate-ripple rounded-full bg-pool-foreground" />
                <Check className="size-5" aria-hidden="true" />
              </span>
              {FOOD_COPY.added(added)}
            </p>
          )}
          <DayPicker date={date} onChange={setDate} />
          <NutritionSummary entries={entries} targets={targets} />
          <Button size="lg" className="sticky bottom-24 z-10 w-full shadow-lg lg:bottom-6"
            onClick={() => { setEditingEntry(null); setIsFormOpen(true); setError(null); setAdded(null); }}>
            <Plus className="size-5" aria-hidden="true" />{FOOD_COPY.add}
          </Button>
          <NutritionEntryHistory entries={entries} loading={loading} onDelete={handleDeleteEntry}
            onEdit={(entry) => { setEditingEntry(entry); setIsFormOpen(true); setError(null); }} />
          <Disclosure summary={FOOD_COPY.week.title}>
            <SevenDayNutritionSummary refreshKey={historyVersion} />
          </Disclosure>
          <Disclosure summary={FOOD_COPY.goals.title}>
            <NutritionTargetForm targets={targets} saving={saving} onSave={handleSaveTargets} />
          </Disclosure>
        </>
      )}
    </div>
  );
};
