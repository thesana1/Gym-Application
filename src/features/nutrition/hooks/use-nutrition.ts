'use client';

import { useCallback, useState } from 'react';

import type {
  NutritionEntry,
  NutritionTargets,
} from '@/features/nutrition/service/nutrition.service';
import type {
  NutritionEntryType,
  NutritionTargetsType,
} from '@/features/nutrition/validations/nutrition.validation';
import { http } from '@/shared/lib/http';

export const useNutrition = () => {
  const [targets, setTargets] = useState<NutritionTargets | null>(null);
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTargets = useCallback(async () => {
    setError(null);
    try {
      setTargets(await http.get<NutritionTargets | null>('/nutrition/targets'));
    } catch {
      setError('We could not load your nutrition targets. Please try again.');
    }
  }, []);

  const loadEntries = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      setEntries(
        await http.get<NutritionEntry[]>('/nutrition/entries', {
          params: { date },
        })
      );
    } catch {
      setError('We could not load your food log. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveTargets = useCallback(async (value: NutritionTargetsType) => {
    setSaving(true);
    setError(null);
    try {
      setTargets(
        await http.put<NutritionTargets>('/nutrition/targets', value)
      );
      return true;
    } catch {
      setError('We could not save your targets. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const saveEntry = useCallback(
    async (entryId: string | null, value: NutritionEntryType) => {
      setSaving(true);
      setError(null);
      try {
        if (entryId) {
          await http.patch(`/nutrition/entries/${entryId}`, value);
        } else {
          await http.post('/nutrition/entries', value);
        }
        return true;
      } catch {
        setError('We could not save this food entry. Please try again.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const deleteEntry = useCallback(async (entryId: string) => {
    setError(null);
    try {
      await http.delete(`/nutrition/entries/${entryId}`);
      return true;
    } catch {
      setError('We could not delete this food entry. Please try again.');
      return false;
    }
  }, []);

  return {
    targets,
    entries,
    loading,
    saving,
    error,
    loadTargets,
    loadEntries,
    saveTargets,
    saveEntry,
    deleteEntry,
    setError,
  };
};
