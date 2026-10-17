import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import type {
  NutritionEntry,
  NutritionTargets,
} from '@/features/nutrition/service/nutrition.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

type TodayNutritionCardProps = {
  entries: NutritionEntry[];
  targets: NutritionTargets | null;
};

const sumNutrition = (entries: NutritionEntry[]) =>
  entries.reduce(
    (total, entry) => ({
      calories: total.calories + entry.calories,
      proteinGrams: total.proteinGrams + entry.proteinGrams,
      carbohydrateGrams: total.carbohydrateGrams + entry.carbohydrateGrams,
      fatGrams: total.fatGrams + entry.fatGrams,
      fiberGrams: total.fiberGrams + entry.fiberGrams,
      waterMl: total.waterMl + (entry.waterMl ?? 0),
    }),
    {
      calories: 0,
      proteinGrams: 0,
      carbohydrateGrams: 0,
      fatGrams: 0,
      fiberGrams: 0,
      waterMl: 0,
    }
  );

const formatAmount = (value: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(value);

const SummaryValue = ({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) => (
  <div className="rounded-md border p-3">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="mt-1 text-sm font-semibold">
      {formatAmount(value)} {unit}
    </dd>
  </div>
);

export const TodayNutritionCard = ({
  entries,
  targets,
}: TodayNutritionCardProps) => {
  const totals = sumNutrition(entries);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Nutrition log</CardTitle>
        <CardDescription>
          Totals are based on the food and water you entered today.
          {targets
            ? ' Your targets are the values you entered.'
            : ' Add your own targets if useful; none are set.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {entries.length ? (
          <>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <SummaryValue label="Calories" value={totals.calories} unit="kcal" />
              <SummaryValue label="Protein" value={totals.proteinGrams} unit="g" />
              <SummaryValue label="Carbohydrates" value={totals.carbohydrateGrams} unit="g" />
              <SummaryValue label="Fat" value={totals.fatGrams} unit="g" />
              <SummaryValue label="Fiber" value={totals.fiberGrams} unit="g" />
              <SummaryValue label="Water" value={totals.waterMl} unit="ml" />
            </dl>
            {targets && (
              <p className="text-xs text-muted-foreground">
                User-entered targets — calories {formatAmount(targets.calories)} kcal,
                {' '}protein {formatAmount(targets.proteinGrams)} g.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No food or water entries logged today.
          </p>
        )}
        <Link
          href="/dashboard/nutrition"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Review nutrition log <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
};
