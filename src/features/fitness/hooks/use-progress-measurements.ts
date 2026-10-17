'use client';

import { useCallback, useState } from 'react';

import type { ProgressMeasurement } from '@/features/fitness/service/progress-measurement.service';
import type { ProgressMeasurementType } from '@/features/fitness/validations/progress-measurement.validation';
import { http } from '@/shared/lib/http';

export const useProgressMeasurements = () => {
  const [measurements, setMeasurements] = useState<ProgressMeasurement[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMeasurements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMeasurements(
        await http.get<ProgressMeasurement[]>('/fitness/measurements')
      );
    } catch {
      setError('We could not load your measurement history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveMeasurement = useCallback(
    async (
      measurementId: string | null,
      value: ProgressMeasurementType
    ): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        if (measurementId) {
          await http.patch(`/fitness/measurements/${measurementId}`, value);
        } else {
          await http.post('/fitness/measurements', value);
        }
        return true;
      } catch {
        setError('We could not save this measurement. Please try again.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const deleteMeasurement = useCallback(async (measurementId: string) => {
    setError(null);
    try {
      await http.delete(`/fitness/measurements/${measurementId}`);
      return true;
    } catch {
      setError('We could not delete this measurement. Please try again.');
      return false;
    }
  }, []);

  return {
    measurements,
    loading,
    saving,
    error,
    loadMeasurements,
    saveMeasurement,
    deleteMeasurement,
    setError,
  };
};
