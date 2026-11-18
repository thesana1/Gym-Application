import { ArrowRight, Flame } from 'lucide-react';
import Link from 'next/link';

import type { FoodPickHighlight, FoodPicks as FoodPicksData } from '@/features/nutrition/service/food-picks.service';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { HOME_COPY } from '@/shared/const/copy-home.const';
import type { MealRecipe } from '@/shared/const/meal-recipes.const';

const copy = HOME_COPY.foodPicks;

const highlightText = (highlight: FoodPickHighlight, { nutritionEstimate: n }: MealRecipe) => {
  if (highlight === 'protein') return copy.highlight.protein(n.proteinGrams);
  if (highlight === 'calories') return copy.highlight.calories(n.calories);
  if (highlight === 'carbs') return copy.highlight.carbs(n.carbohydrateGrams);
  return copy.highlight.fiber(n.fiberGrams);
};

const FoodPickCard = ({ recipe, highlight }: { recipe: MealRecipe; highlight: FoodPickHighlight }) => (
  <li className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
    <span className="self-start rounded-full bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">{highlightText(highlight, recipe)}</span>
    <h3 className="text-lg font-semibold leading-snug">{recipe.name}</h3>
    <p className="flex flex-col gap-1 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1 font-mono font-medium text-foreground tabular-nums">
        <Flame className="size-4 text-primary" aria-hidden="true" />{copy.calories(recipe.nutritionEstimate.calories)}
      </span>
      <span className="tabular-nums">
        {copy.macros(recipe.nutritionEstimate.proteinGrams, recipe.nutritionEstimate.carbohydrateGrams, recipe.nutritionEstimate.fatGrams)}
      </span>
    </p>
    <Disclosure summary={copy.howTo} className="mt-auto bg-background">
      <div className="flex flex-col gap-3 text-sm">
        <div>
          <h4 className="font-semibold">{copy.ingredients}</h4>
          <ul className="mt-1 list-disc pl-5">{recipe.ingredients.map((item) => <li key={item.name}>{item.amount} {item.name}</li>)}</ul>
        </div>
        <div>
          <h4 className="font-semibold">{copy.steps}</h4>
          <ol className="mt-1 list-decimal space-y-1 pl-5">{recipe.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        </div>
      </div>
    </Disclosure>
  </li>
);

type FoodPicksProps = { picks: FoodPicksData; goalLabel?: string };

export const FoodPicks = ({ picks, goalLabel }: FoodPicksProps) => (
  <section aria-labelledby="food-picks" className="flex flex-col gap-3">
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 id="food-picks" className="text-2xl font-semibold">{copy.title}</h2>
        <p className="text-base text-muted-foreground">{goalLabel ? copy.forGoal(goalLabel) : copy.general}</p>
      </div>
      <Link href="/dashboard/food-generator"
        className="inline-flex min-h-11 items-center gap-1 rounded-lg text-base font-semibold text-primary focus-visible:outline-2 focus-visible:outline-ring">
        {copy.more}<ArrowRight className="size-5" aria-hidden="true" />
      </Link>
    </div>
    <ul className="grid gap-3 sm:grid-cols-2">
      {picks.recipes.map((recipe) => <FoodPickCard key={recipe.id} recipe={recipe} highlight={picks.highlight} />)}
    </ul>
  </section>
);
