'use client';

import { useEffect, useState } from 'react';

import { AiMealIdeas } from '@/features/nutrition/components/ai-meal-ideas';
import { LibraryRecipeCard } from '@/features/nutrition/components/library-recipe-card';
import { useAiMealIdeas } from '@/features/nutrition/hooks/use-ai-meal-ideas';
import type { GeneratedMeal } from '@/features/nutrition/service/meal-generator.service';
import { MealGeneratorSchema, type MealGeneratorType } from '@/features/nutrition/validations/meal-generator.validation';
import { PageHeader } from '@/shared/components/layout/page-header';
import { SectionTabs } from '@/shared/components/layout/section-tabs';
import { Button } from '@/shared/components/ui/button';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { Select } from '@/shared/components/ui/select';
import { FOOD_COPY } from '@/shared/const/copy-food.const';
import { FOOD_TABS } from '@/shared/const/navigation.const';
import { FOOD_ALLERGENS, MEAL_PREFERENCES } from '@/shared/const/nutrition.const';
import { http } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';

const copy = FOOD_COPY.ideas;

type Suggestions = { recipes: GeneratedMeal[] };

export const MealGenerator = () => {
  const [ingredientText, setIngredientText] = useState('');
  const [preference, setPreference] = useState('any');
  const [excludedAllergens, setExcludedAllergens] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ai = useAiMealIdeas();
  const { loadSaved } = ai;

  useEffect(() => {
    void loadSaved();
  }, [loadSaved]);

  const buildInput = (): MealGeneratorType | null => {
    const parsed = MealGeneratorSchema.safeParse({
      ingredients: ingredientText.split(',').map((ingredient) => ingredient.trim()).filter(Boolean),
      preference,
      excludedAllergens,
    });
    if (!parsed.success) {
      setError(copy.needOne);
      return null;
    }
    setError(null);
    return parsed.data;
  };

  const generate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = buildInput();
    if (!input) return;
    setLoading(true);
    setSuggestions(null);
    try {
      setSuggestions(await http.post<Suggestions>('/nutrition/recipes', input));
    } catch {
      setError(copy.failed);
    } finally {
      setLoading(false);
    }
  };

  const askAi = () => {
    const input = buildInput();
    if (input) void ai.generate(input);
  };

  const toggleAllergen = (value: string, checked: boolean) => {
    setExcludedAllergens((current) => (checked ? [...current, value] : current.filter((allergen) => allergen !== value)));
  };

  return (
    <div className="flex animate-rise flex-col gap-5">
      <PageHeader title={FOOD_COPY.title} description={copy.description} className="mb-1">
        <SectionTabs tabs={FOOD_TABS} />
      </PageHeader>

      <form className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5" onSubmit={generate} noValidate>
        <label className="flex flex-col gap-2 text-lg font-semibold">
          {copy.ingredients}
          <textarea value={ingredientText} onChange={(event) => setIngredientText(event.target.value)} placeholder={copy.placeholder} rows={3}
            maxLength={1000} aria-describedby="ingredients-help" aria-invalid={Boolean(error)}
            className="w-full rounded-lg border border-input bg-background px-3 py-3 text-lg font-normal focus-visible:outline-2 focus-visible:outline-ring" />
          <span id="ingredients-help" className="text-base font-normal text-muted-foreground">{copy.ingredientsHelp}</span>
        </label>

        <Disclosure summary={copy.more} className="bg-background">
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-base font-medium">
              {copy.mealType}
              <Select value={preference} onChange={(event) => setPreference(event.target.value)}>
                {MEAL_PREFERENCES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </Select>
            </label>
            <fieldset className="flex flex-col gap-2">
              <legend className="text-base font-medium">{copy.allergens}</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {FOOD_ALLERGENS.map(({ value, label }) => {
                  const checked = excludedAllergens.includes(value);
                  return (
                    <label key={value} className={cn('flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 text-base font-medium',
                      'has-focus-visible:outline-2 has-focus-visible:outline-ring',
                      checked ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card')}>
                      <input type="checkbox" checked={checked} onChange={(event) => toggleAllergen(value, event.target.checked)} className="size-5" />
                      {label}
                    </label>
                  );
                })}
              </div>
              <p className="text-base text-muted-foreground">{copy.allergensHelp}</p>
            </fieldset>
          </div>
        </Disclosure>

        {error && <p className="text-base text-destructive" role="alert">{error}</p>}
        <Button type="submit" size="lg" disabled={loading}>{loading ? copy.finding : copy.find}</Button>
        <Button type="button" variant="outline" disabled={ai.loading} onClick={askAi}>{ai.loading ? copy.asking : copy.askAi}</Button>
        {ai.usage && <p className="text-center text-base text-muted-foreground">{copy.aiLeft(ai.usage.used, ai.usage.limit)}</p>}
      </form>

      {suggestions && (
        <section aria-labelledby="meal-results" className="flex flex-col gap-4">
          <h2 id="meal-results" className="text-xl font-semibold">{copy.results}</h2>
          {suggestions.recipes.length === 0 && <p className="text-base text-muted-foreground" role="status">{copy.noLibrary}</p>}
          {suggestions.recipes.map((recipe) => <LibraryRecipeCard key={recipe.id} recipe={recipe} />)}
        </section>
      )}

      <AiMealIdeas result={ai.result} saved={ai.saved} loading={ai.loading} error={ai.error} />
    </div>
  );
};
