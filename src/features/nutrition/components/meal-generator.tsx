'use client';

import { useState } from 'react';

import type { GeneratedMeal } from '@/features/nutrition/service/meal-generator.service';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { MEAL_PREFERENCES } from '@/shared/const/nutrition.const';
import { FOOD_ALLERGENS } from '@/shared/const/nutrition.const';
import { http } from '@/shared/lib/http';

type Suggestions = {
  recipes: GeneratedMeal[];
  message?: string;
};

export const MealGenerator = () => {
  const [ingredientText, setIngredientText] = useState('');
  const [preference, setPreference] = useState('any');
  const [excludedAllergens, setExcludedAllergens] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuggestions(null);

    const ingredients = ingredientText
      .split(',')
      .map((ingredient) => ingredient.trim())
      .filter(Boolean);

    try {
      const result = await http.post<Suggestions>('/nutrition/recipes', {
        ingredients,
        preference,
        excludedAllergens,
      });
      setSuggestions(result);
    } catch {
      setError('We could not generate meal ideas. Please check your ingredients and try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergen = (value: string, checked: boolean) => {
    setExcludedAllergens((current) =>
      checked ? [...current, value] : current.filter((allergen) => allergen !== value)
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Make something with what you have
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Meal ideas</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter ingredients you have on hand and choose what matters for this meal.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your ingredients and preferences</CardTitle>
          <CardDescription>
            This is a small curated recipe library. Suggestions appear only when
            all listed ingredients are in your input. Nutrition values are
            rough estimates for generic portions, not database-verified facts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={generate}>
            <label className="grid gap-2 text-sm font-medium">
              Ingredients (comma-separated)
              <textarea
                value={ingredientText}
                onChange={(event) => setIngredientText(event.target.value)}
                placeholder="chicken breast, rice, tomato, olive oil"
                rows={3}
                maxLength={1000}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
              <span className="text-xs font-normal text-muted-foreground">
                Add the full ingredient names. Quantities are included with each
                recipe.
              </span>
            </label>

            <label className="grid max-w-md gap-2 text-sm font-medium">
              Meal preference
              <select
                value={preference}
                onChange={(event) => setPreference(event.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {MEAL_PREFERENCES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <span className="text-xs font-normal text-muted-foreground">
                Preferences filter rough recipe values; they do not guarantee
                fitness or weight outcomes.
              </span>
            </label>

            <fieldset>
              <legend className="text-sm font-medium">Exclude listed allergens</legend>
              <p className="mt-1 text-xs text-muted-foreground">
                The tags below are not a safety guarantee. Always check product
                labels and prevent cross-contact.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {FOOD_ALLERGENS.map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={excludedAllergens.includes(value)}
                      onChange={(event) => toggleAllergen(value, event.target.checked)}
                      className="size-4 accent-primary"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Finding ideas...' : 'Find meal ideas'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {suggestions && (
        <section aria-label="Meal suggestions" className="space-y-4">
          <h2 className="text-lg font-semibold">Meal suggestions</h2>
          {suggestions.message && (
            <p className="text-sm text-muted-foreground" role="status">
              {suggestions.message}
            </p>
          )}
          {suggestions.recipes.map((recipe) => (
            <Card key={recipe.id}>
              <CardHeader>
                <CardTitle className="text-base">{recipe.name}</CardTitle>
                <CardDescription>
                  Estimated nutrition per recipe serving ·{' '}
                  {recipe.nutritionEstimate.calories} kcal ·{' '}
                  {recipe.nutritionEstimate.proteinGrams} g protein ·{' '}
                  {recipe.nutritionEstimate.carbohydrateGrams} g carbs ·{' '}
                  {recipe.nutritionEstimate.fatGrams} g fat ·{' '}
                  {recipe.nutritionEstimate.fiberGrams} g fiber
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Ingredients</h3>
                  <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                    {recipe.ingredients.map((ingredient) => (
                      <li key={ingredient.name}>
                        {ingredient.amount} {ingredient.name}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Steps</h3>
                  <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                    {recipe.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Possible substitutions</h3>
                  <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                    {recipe.substitutions.map((substitution) => (
                      <li key={substitution}>{substitution}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground">
                  Allergens tagged: {recipe.allergens.length ? recipe.allergens.join(', ') : 'none in listed ingredients'}.
                  Check every package for allergens and cross-contact warnings.
                  Nutrition estimates vary by portion, brand, and preparation.
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
};
