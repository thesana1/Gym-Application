import type { NutritionEntry, NutritionTargets } from '@/features/nutrition/service/nutrition.service';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { LaneRope } from '@/shared/components/ui/lane-rope';
import { Meter } from '@/shared/components/ui/meter';
import { FOOD_COPY } from '@/shared/const/copy-food.const';

type NutritionSummaryProps = {
  entries: NutritionEntry[];
  targets: NutritionTargets | null;
};

const copy = FOOD_COPY.summary;
const units = FOOD_COPY.units;
const FLOATS = 10;

export const sumEntries = (entries: NutritionEntry[]) => entries.reduce(
  (sum, entry) => ({
    calories: sum.calories + entry.calories,
    proteinGrams: sum.proteinGrams + entry.proteinGrams,
    carbohydrateGrams: sum.carbohydrateGrams + entry.carbohydrateGrams,
    fatGrams: sum.fatGrams + entry.fatGrams,
    fiberGrams: sum.fiberGrams + entry.fiberGrams,
    waterMl: sum.waterMl + (entry.waterMl ?? 0),
  }),
  { calories: 0, proteinGrams: 0, carbohydrateGrams: 0, fatGrams: 0, fiberGrams: 0, waterMl: 0 }
);

export const NutritionSummary = ({ entries, targets }: NutritionSummaryProps) => {
  const totals = sumEntries(entries);
  return (
    <section aria-label={copy.calories} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-col gap-3">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-heading text-6xl font-extrabold tracking-display">{Math.round(totals.calories).toLocaleString()}</span>
          <span className="text-lg text-muted-foreground">{targets?.calories ? copy.of(targets.calories) : units.kcal}</span>
        </p>
        {targets?.calories ? (
          <LaneRope total={FLOATS} filled={Math.min(FLOATS, Math.round((totals.calories / targets.calories) * FLOATS))} label={copy.calories}
            value={{ now: totals.calories, max: targets.calories }} className="justify-between" />
        ) : null}
        {targets?.calories && totals.calories >= targets.calories ? <p className="font-bold text-pool">{copy.reached}</p> : null}
      </div>
      <div className="border-t border-border" />
      <Meter label={copy.protein} value={totals.proteinGrams} target={targets?.proteinGrams} unit={units.g} />
      <Meter label={copy.water} value={totals.waterMl} target={targets?.waterMl} unit={units.ml} />
      <Disclosure summary={copy.more} className="border-0 bg-muted">
        <div className="flex flex-col gap-4">
          <Meter label={copy.carbs} value={totals.carbohydrateGrams} target={targets?.carbohydrateGrams} unit={units.g} />
          <Meter label={copy.fat} value={totals.fatGrams} target={targets?.fatGrams} unit={units.g} />
          <Meter label={copy.fiber} value={totals.fiberGrams} target={targets?.fiberGrams} unit={units.g} />
        </div>
      </Disclosure>
      <p className="text-base text-muted-foreground">{copy.estimate}</p>
    </section>
  );
};
