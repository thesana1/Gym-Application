import type {
  NutritionEntry,
  NutritionTargets,
} from '@/features/nutrition/service/nutrition.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

type NutritionSummaryProps = {
  entries: NutritionEntry[];
  targets: NutritionTargets | null;
};

export const NutritionSummary = ({ entries, targets }: NutritionSummaryProps) => {
  const totals = entries.reduce(
    (sum, entry) => ({
      calories: sum.calories + entry.calories,
      proteinGrams: sum.proteinGrams + entry.proteinGrams,
      carbohydrateGrams: sum.carbohydrateGrams + entry.carbohydrateGrams,
      fatGrams: sum.fatGrams + entry.fatGrams,
      fiberGrams: sum.fiberGrams + entry.fiberGrams,
      waterMl: sum.waterMl + (entry.waterMl ?? 0),
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

  const metrics = [
    { label: 'Calories', unit: 'kcal', value: totals.calories, target: targets?.calories },
    { label: 'Protein', unit: 'g', value: totals.proteinGrams, target: targets?.proteinGrams },
    {
      label: 'Carbohydrates',
      unit: 'g',
      value: totals.carbohydrateGrams,
      target: targets?.carbohydrateGrams,
    },
    { label: 'Fat', unit: 'g', value: totals.fatGrams, target: targets?.fatGrams },
    { label: 'Fiber', unit: 'g', value: totals.fiberGrams, target: targets?.fiberGrams },
    { label: 'Water', unit: 'ml', value: totals.waterMl, target: targets?.waterMl },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily intake</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {metrics.map(({ label, unit, value, target }) => (
            <div key={label} className="rounded-md border border-border p-3">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-1 text-lg font-semibold">
                {value} <span className="text-xs font-normal">{unit}</span>
              </dd>
              {target !== undefined && (
                <dd className="mt-1 text-xs text-muted-foreground">
                  Target: {target} {unit}
                </dd>
              )}
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Totals are calculated from your entries only. Food label values and
          portions may differ from what you record.
        </p>
      </CardContent>
    </Card>
  );
};
