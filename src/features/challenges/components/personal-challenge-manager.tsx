'use client';

import { useCallback, useEffect, useState } from 'react';

import type { PersonalChallenge } from '@/features/challenges/service/challenge.service';
import { PageHeader } from '@/shared/components/layout/page-header';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Meter } from '@/shared/components/ui/meter';
import { CHALLENGES_COPY } from '@/shared/const/copy-account.const';
import { http } from '@/shared/lib/http';

const copy = CHALLENGES_COPY;

const getErrorMessage = (error: unknown) => (error instanceof Error ? copy.errors[error.message] : undefined) ?? copy.errors.default;

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '');

export const PersonalChallengeManager = () => {
  const [challenges, setChallenges] = useState<PersonalChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadChallenges = useCallback(async () => {
    setError(null);
    try {
      const data = await http.get<PersonalChallenge[]>('/challenges');
      setChallenges(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChallenges();
  }, [loadChallenges]);

  const joinChallenge = async (challengeId: string) => {
    setSavingId(challengeId);
    setError(null);
    try {
      await http.post('/challenges', { challengeId });
      await loadChallenges();
    } catch (joinError) {
      setError(getErrorMessage(joinError));
    } finally {
      setSavingId(null);
    }
  };

  const leaveChallenge = async (challengeId: string) => {
    if (!window.confirm(copy.confirmLeave)) return;
    setSavingId(challengeId);
    setError(null);
    try {
      await http.delete('/challenges', {
        params: { challengeId },
      });
      await loadChallenges();
    } catch (leaveError) {
      setError(getErrorMessage(leaveError));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="flex animate-rise flex-col gap-4">
      <PageHeader title={copy.title} description={copy.description} className="mb-2" />
      {error && <p className="text-base text-destructive" role="alert">{error}</p>}
      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-muted" role="status" aria-label={copy.loading} />
      ) : challenges.length === 0 ? (
        <EmptyState message={copy.empty} />
      ) : (
        <ul className="flex flex-col gap-3">
          {challenges.map((challenge, index) => {
            const suggested = challenges.findIndex(({ status }) => status === 'not-joined') === index;
            const joined = challenge.status !== 'not-joined';
            const busy = savingId === challenge.id;
            return (
              <li key={challenge.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h2 className="text-xl font-semibold">{challenge.title}</h2>
                    {joined && <span className="text-base font-semibold text-primary">{copy.status[challenge.status]}</span>}
                  </div>
                  <p className="mt-1 text-lg">{challenge.description}</p>
                </div>
                {joined ? (
                  <>
                    <Meter label={copy.workouts} value={Math.min(challenge.completedWorkouts, challenge.targetWorkouts)}
                      target={challenge.targetWorkouts} unit="" />
                    <p className="text-base text-muted-foreground">{copy.dates(formatDate(challenge.joinedAt), formatDate(challenge.endsAt))}</p>
                    <Button variant="ghost" className="w-full text-muted-foreground sm:w-fit" disabled={busy}
                      onClick={() => void leaveChallenge(challenge.id)}>
                      {busy ? copy.updating : copy.leave}
                    </Button>
                  </>
                ) : (
                  <Button size="lg" variant={suggested ? 'default' : 'outline'} className="w-full sm:w-fit" disabled={busy}
                    onClick={() => void joinChallenge(challenge.id)}>
                    {busy ? copy.updating : copy.join}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-base text-muted-foreground">{copy.privateNote} {copy.rest}</p>
    </div>
  );
};
