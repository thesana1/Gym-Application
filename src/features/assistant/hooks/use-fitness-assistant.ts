'use client';

import { useCallback, useState } from 'react';

import type { FitnessAnswerResponse, FitnessQuestionHistory } from '@/features/assistant/service/fitness-question.service';
import { AI_ERROR_MESSAGES } from '@/shared/const/ai.const';
import { http } from '@/shared/lib/http';
import type { AiUsage } from '@/shared/types/ai';

export const useFitnessAssistant = () => {
  const [latest, setLatest] = useState<FitnessAnswerResponse | null>(null);
  const [history, setHistory] = useState<FitnessQuestionHistory['history']>([]);
  const [usage, setUsage] = useState<AiUsage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const data = await http.get<FitnessQuestionHistory>('/assistant');
      setHistory(data.history);
      setUsage(data.usage);
    } catch {
      setError('We could not load your previous questions.');
    }
  }, []);

  const ask = useCallback(async (question: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await http.post<FitnessAnswerResponse>('/assistant', { question });
      setLatest(data);
      setUsage(data.usage);
      if (data.source === 'ai') await loadHistory();
      return true;
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : '';
      setError(
        code === 'VALIDATION_ERROR'
          ? 'Ask a question between 5 and 500 characters.'
          : AI_ERROR_MESSAGES[code] ?? AI_ERROR_MESSAGES.AI_UNAVAILABLE
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadHistory]);

  return { latest, history, usage, loading, error, ask, loadHistory };
};
