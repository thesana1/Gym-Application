'use client';

import { useCallback, useState } from 'react';

import {
  FitnessProfileInput,
  FitnessProfileType,
} from '@/features/fitness/validations/fitness-profile.validation';
import { http } from '@/shared/lib/http';

export const useFitnessProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (): Promise<FitnessProfileInput | null> => {
    setLoading(true);
    setError(null);

    try {
      return await http.get<FitnessProfileInput | null>('/fitness/profile');
    } catch {
      setError('We could not load your profile. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (profile: FitnessProfileType): Promise<boolean> => {
    setSaving(true);
    setError(null);

    try {
      await http.put('/fitness/profile', profile);
      return true;
    } catch {
      setError('We could not save your profile. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { loading, saving, error, loadProfile, saveProfile };
};
