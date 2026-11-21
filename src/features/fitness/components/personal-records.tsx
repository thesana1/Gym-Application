'use client';

import { useCallback, useEffect, useState } from 'react';

import { ProgressHeader } from '@/features/fitness/components/progress-header';
import type { PersonalExerciseRecord } from '@/features/fitness/service/personal-record.service';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { PROGRESS_COPY } from '@/shared/const/copy-progress.const';
import { http } from '@/shared/lib/http';

const copy = PROGRESS_COPY.lifts;

export const PersonalRecords = () => {
  const [records, setRecords] = useState<PersonalExerciseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadRecords = useCallback(async () => {
    setError(false);
    setLoading(true);
    try {
      setRecords(await http.get<PersonalExerciseRecord[]>('/fitness/records'));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  return (
    <div className="mx-auto w-full max-w-2xl animate-rise">
      <ProgressHeader />
      {error ? (
        <div className="flex flex-col items-start gap-3" role="alert">
          <p className="text-base text-destructive">{copy.error}</p>
          <Button variant="outline" onClick={() => void loadRecords()}>{COMMON_COPY.tryAgain}</Button>
        </div>
      ) : loading ? (
        <div className="h-40 animate-pulse rounded-lg bg-muted" role="status" aria-label={copy.loading} />
      ) : records.length === 0 ? (
        <EmptyState message={copy.empty} />
      ) : (
        <div className="flex flex-col gap-3">
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
            {records.map((record) => (
              <li key={record.exerciseId} className="flex flex-col gap-1 p-4">
                <h2 className="text-lg">{record.exerciseName}</h2>
                <p className="text-lg font-semibold tabular-nums text-primary-ink">
                  {record.heaviestSet ? copy.heaviest(record.heaviestSet.weightKg, record.heaviestSet.repetitions) : copy.noWeight}
                </p>
                <p className="text-base tabular-nums">{copy.mostReps(record.highestRepSet.repetitions, record.highestRepSet.weightKg)}</p>
                <p className="text-base text-muted-foreground">{copy.times(record.workoutCount)}</p>
              </li>
            ))}
          </ul>
          <p className="text-base text-muted-foreground">{copy.note}</p>
        </div>
      )}
    </div>
  );
};
