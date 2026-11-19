import { AiMealCard } from '@/features/nutrition/components/ai-meal-card';
import { LibraryRecipeCard } from '@/features/nutrition/components/library-recipe-card';
import type { AiMealIdeasResponse, SavedMealIdeas } from '@/features/nutrition/service/ai-meal.service';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { AI_DISCLAIMERS, AI_ERROR_MESSAGES } from '@/shared/const/ai.const';
import { FOOD_COPY } from '@/shared/const/copy-food.const';

type AiMealIdeasProps = {
  result: AiMealIdeasResponse | null;
  saved: SavedMealIdeas['saved'];
  loading: boolean;
  error: string | null;
};

const copy = FOOD_COPY.ideas;

export const AiMealIdeas = ({ result, saved, loading, error }: AiMealIdeasProps) => (
  <>
    {(loading || error || result) && (
      <section aria-labelledby="ai-meal-ideas-title" className="flex flex-col gap-4">
        <h2 id="ai-meal-ideas-title" className="text-xl">{copy.aiResults}</h2>
        {loading && <div role="status" className="rounded-lg border border-border bg-card p-5 text-base">{copy.aiWait}</div>}
        {error && <p role="alert" className="text-base text-destructive">{error}</p>}
        {result?.source === 'library' && (
          <>
            <p role="status" className="rounded-lg border border-border bg-card p-4 text-base">
              {AI_ERROR_MESSAGES[result.notice ?? ''] ?? AI_ERROR_MESSAGES.AI_UNAVAILABLE} {copy.fallback}
            </p>
            {result.libraryRecipes.length === 0 && <p className="text-base text-muted-foreground">{copy.noLibrary}</p>}
            {result.libraryRecipes.map((recipe) => <LibraryRecipeCard key={recipe.id} recipe={recipe} />)}
          </>
        )}
        {result && result.source !== 'library' && (
          <>
            <p role="status" className="text-base text-muted-foreground">{result.source === 'saved' ? copy.aiSaved : copy.aiNew}</p>
            {result.meals.length === 0 && <p className="text-base text-muted-foreground">{copy.aiNone}</p>}
            {result.meals.map((meal) => <AiMealCard key={meal.name} meal={meal} />)}
            <p className="text-base text-muted-foreground">{AI_DISCLAIMERS.nutrition}</p>
          </>
        )}
      </section>
    )}
    {saved.length > 0 && (
      <Disclosure summary={copy.savedTitle}>
        <div className="flex flex-col gap-3">
          {saved.map((item) => (
            <Disclosure key={item.id} className="bg-background"
              summary={copy.savedItem(item.label, new Date(item.createdAt).toLocaleDateString(), item.data.meals.length)}>
              <div className="flex flex-col gap-3">{item.data.meals.map((meal) => <AiMealCard key={meal.name} meal={meal} />)}</div>
            </Disclosure>
          ))}
          <p className="text-base text-muted-foreground">{AI_DISCLAIMERS.nutrition}</p>
        </div>
      </Disclosure>
    )}
  </>
);
