import type { GeneratedMeal } from '@/features/nutrition/service/meal-generator.service';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { FOOD_COPY } from '@/shared/const/copy-food.const';
import { FOOD_ALLERGENS } from '@/shared/const/nutrition.const';

const copy = FOOD_COPY.recipe;

export const allergenNames = (values: readonly string[]) =>
  values.map((value) => FOOD_ALLERGENS.find((allergen) => allergen.value === value)?.label ?? value).join(', ');

export const LibraryRecipeCard = ({ recipe }: { recipe: GeneratedMeal }) => (
  <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
    <h3 className="text-xl font-semibold">{recipe.name}</h3>
    <p className="text-base font-medium">
      {recipe.missingIngredients.length === 0 ? copy.haveAll : copy.have(recipe.matchedIngredients.length, recipe.ingredients.length)}
      {recipe.missingIngredients.length > 0 && <span className="block text-muted-foreground">{copy.stillNeed(recipe.missingIngredients.join(', '))}</span>}
    </p>
    <p className="text-base tabular-nums text-muted-foreground">{copy.about(recipe.nutritionEstimate.calories, recipe.nutritionEstimate.proteinGrams)}</p>
    <Disclosure summary={copy.howTo} className="bg-background">
      <div className="flex flex-col gap-4 text-base">
        <div>
          <h4 className="font-semibold">{copy.ingredients}</h4>
          <ul className="mt-1 list-disc pl-5">{recipe.ingredients.map((item) => <li key={item.name}>{item.amount} {item.name}</li>)}</ul>
        </div>
        <div>
          <h4 className="font-semibold">{copy.steps}</h4>
          <ol className="mt-1 list-decimal space-y-1 pl-5">{recipe.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        </div>
        {recipe.substitutions.length > 0 && (
          <div>
            <h4 className="font-semibold">{copy.swaps}</h4>
            <ul className="mt-1 list-disc pl-5">{recipe.substitutions.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        )}
        <p className="text-muted-foreground">{copy.allergens(allergenNames(recipe.allergens))}</p>
      </div>
    </Disclosure>
  </article>
);
