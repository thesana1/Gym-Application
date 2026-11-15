import { Plus } from 'lucide-react';
import Link from 'next/link';

import type { NutritionEntry, NutritionTargets } from '@/features/nutrition/service/nutrition.service';
import { Button } from '@/shared/components/ui/button';
import { Meter } from '@/shared/components/ui/meter';
import { HOME_COPY } from '@/shared/const/copy-home.const';

type TodayNutritionCardProps = {
  entries: NutritionEntry[];
  targets: NutritionTargets | null;
};

const copy = HOME_COPY.food;

export const TodayNutritionCard = ({ entries, targets }: TodayNutritionCardProps) => {
  const calories = entries.reduce((total, entry) => total + entry.calories, 0);
  return (
    <section aria-labelledby="today-food" className="rounded-2xl border border-border bg-card p-5">
      <h2 id="today-food" className="text-xl font-semibold">{copy.title}</h2>
      <Meter className="mt-4" label={copy.calories} value={calories} target={targets?.calories} unit={copy.caloriesUnit} />
      {entries.length === 0 || !targets ? (
        <p className="mt-3 text-base text-muted-foreground">{entries.length === 0 ? copy.nothingYet : copy.noGoal}</p>
      ) : null}
      <Button asChild variant="outline" className="mt-5 w-full sm:w-auto">
        <Link href="/dashboard/nutrition?add=1"><Plus className="size-5" aria-hidden="true" />{copy.add}</Link>
      </Button>
    </section>
  );
};
