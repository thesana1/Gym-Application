import { Plus } from 'lucide-react';
import Link from 'next/link';

import type { NutritionEntry, NutritionTargets } from '@/features/nutrition/service/nutrition.service';
import { Button } from '@/shared/components/ui/button';
import { LaneRope } from '@/shared/components/ui/lane-rope';
import { HOME_COPY } from '@/shared/const/copy-home.const';

type TodayNutritionCardProps = {
  entries: NutritionEntry[];
  targets: NutritionTargets | null;
};

const copy = HOME_COPY.food;
const FLOATS = 10;

export const TodayNutritionCard = ({ entries, targets }: TodayNutritionCardProps) => {
  const calories = entries.reduce((total, entry) => total + entry.calories, 0);
  const target = targets?.calories;
  return (
    <section aria-labelledby="today-food" className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 id="today-food" className="text-xl">{copy.title}</h2>
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/nutrition?add=1"><Plus className="size-5" aria-hidden="true" />{copy.add}</Link>
        </Button>
      </div>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-heading text-5xl font-extrabold tracking-display">{calories.toLocaleString()}</span>
        <span className="text-lg text-muted-foreground">{target ? copy.of(target) : copy.caloriesUnit}</span>
      </p>
      {target ? (
        <LaneRope total={FLOATS} filled={Math.min(FLOATS, Math.round((calories / target) * FLOATS))} label={copy.calories}
          value={{ now: calories, max: target }} className="justify-between" />
      ) : null}
      {entries.length === 0 || !targets ? (
        <p className="text-base text-muted-foreground">{entries.length === 0 ? copy.nothingYet : copy.noGoal}</p>
      ) : null}
    </section>
  );
};
