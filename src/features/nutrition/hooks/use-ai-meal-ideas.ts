'use client';

import { useCallback, useState } from 'react';

import type { AiMealIdeasResponse, SavedMealIdeas } from '@/features/nutrition/service/ai-meal.service';
import type { MealGeneratorType } from '@/features/nutrition/validations/meal-generator.validation';
import { AI_ERROR_MESSAGES } from '@/shared/const/ai.const';
import { http } from '@/shared/lib/http';
import type { AiUsage } from '@/shared/types/ai';

export const useAiMealIdeas = () => {
  const [result, setResult] = useState<AiMealIdeasResponse | null>(null);
  const [saved, setSaved] = useState<SavedMealIdeas['saved']>([]);
  const [usage, setUsage] = useState<AiUsage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSaved = useCallback(async () => {
    try {
      const data = await http.get<SavedMealIdeas>('/nutrition/recipes/ai');
      setSaved(data.saved);
      setUsage(data.usage);
    } catch {
      // Saved ideas are optional; generating still works.
    }
  }, []);

  const generate = useCallback(async (input: MealGeneratorType) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await http.post<AiMealIdeasResponse>('/nutrition/recipes/ai', input);
      setResult(data);
      if (data.usage) setUsage(data.usage);
      if (data.source === 'ai') await loadSaved();
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : '';
      setError(AI_ERROR_MESSAGES[code] ?? AI_ERROR_MESSAGES.AI_UNAVAILABLE);
    } finally {
      setLoading(false);
    }
  }, [loadSaved]);

  return { result, saved, usage, loading, error, generate, loadSaved };
};
