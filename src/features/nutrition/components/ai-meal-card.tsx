import { allergenNames } from '@/features/nutrition/components/library-recipe-card';
import type { AiMeal } from '@/features/nutrition/validations/ai-meal.validation';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { FOOD_COPY } from '@/shared/const/copy-food.const';

const copy = FOOD_COPY.recipe;

export const AiMealCard = ({ meal }: { meal: AiMeal }) => (
  <article className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
    <h3 className="text-xl">{meal.name}</h3>
    {meal.summary && <p className="text-base">{meal.summary}</p>}
    <p className="text-base tabular-nums text-muted-foreground">{copy.about(meal.nutritionEstimate.calories, meal.nutritionEstimate.proteinGrams)}</p>
    {meal.missingIngredients.length > 0 && <p className="text-base font-medium">{copy.stillNeed(meal.missingIngredients.join(', '))}</p>}
    {meal.fitsTargets && (
      <p className="rounded-lg bg-primary/25 p-3 text-base"><span className="font-semibold">{copy.fits}</span>{meal.fitsTargets}</p>
    )}
    <Disclosure summary={copy.howTo} className="bg-background">
      <div className="flex flex-col gap-4 text-base">
        <div>
          <h4 className="font-semibold">{copy.ingredients}</h4>
          <ul className="mt-1 list-disc pl-5">
            {meal.ingredients.map((item) => <li key={`${item.name}-${item.amount}`}>{item.amount} {item.name}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">{copy.steps}</h4>
          <ol className="mt-1 list-decimal space-y-1 pl-5">{meal.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        </div>
        <p className="text-muted-foreground">{copy.allergens(allergenNames(meal.allergens))}</p>
      </div>
    </Disclosure>
  </article>
);
