'use client';

import { useCallback, useEffect, useState } from 'react';

import type { PersonalChallenge } from '@/features/challenges/service/challenge.service';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { http } from '@/shared/lib/http';

const STATUS_LABELS: Record<PersonalChallenge['status'], string> = {
  'not-joined': 'Not joined',
  'in-progress': 'In progress',
  completed: 'Completed',
  expired: 'Challenge period ended',
};

const ERROR_MESSAGES: Record<string, string> = {
  NOT_FOUND: 'This enrollment is no longer active. Refresh the page and try again.',
  UNAUTHORIZED: 'Sign in to manage your personal challenges.',
  VALIDATION_ERROR: 'That challenge is not available.',
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? ERROR_MESSAGES[error.message] ?? 'Could not update challenge.'
    : 'Could not update challenge.';

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
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your pace, your choice
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
          Personal challenges
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Optional workout-log milestones. Your participation and progress are
          private to your account. Rest days are part of training; these are
          motivational prompts, not prescriptions.
        </p>
      </header>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="text-sm text-muted-foreground" role="status">
          Loading challenges…
        </p>
      ) : (
        <section aria-label="Available personal challenges" className="grid gap-4">
          {challenges.map((challenge) => {
            const joined = challenge.status !== 'not-joined';

            return (
              <Card key={challenge.id}>
                <CardHeader>
                  <CardTitle className="text-base">{challenge.title}</CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {joined ? (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span>
                          {Math.min(
                            challenge.completedWorkouts,
                            challenge.targetWorkouts
                          )}{' '}
                          of {challenge.targetWorkouts} workouts toward milestone
                        </span>
                        <span className="text-muted-foreground">
                          {STATUS_LABELS[challenge.status]}
                        </span>
                      </div>
                      <progress
                        className="h-2 w-full accent-primary"
                        max={challenge.targetWorkouts}
                        value={Math.min(
                          challenge.completedWorkouts,
                          challenge.targetWorkouts
                        )}
                        aria-label={`${challenge.title} progress`}
                      />
                      <p className="text-xs text-muted-foreground">
                        Started {new Date(challenge.joinedAt ?? '').toLocaleDateString()}.
                        {' '}Ends {new Date(challenge.endsAt ?? '').toLocaleDateString()}.
                        Challenge progress is based on your existing workout logs
                        within the {challenge.durationDays}-day period.
                      </p>
                      <Button
                        className="w-fit"
                        variant="outline"
                        disabled={savingId === challenge.id}
                        onClick={() => void leaveChallenge(challenge.id)}
                      >
                        {savingId === challenge.id
                          ? 'Updating…'
                          : 'Leave and remove progress'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="w-fit"
                      disabled={savingId === challenge.id}
                      onClick={() => void joinChallenge(challenge.id)}
                    >
                      {savingId === challenge.id ? 'Joining…' : 'Join challenge'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
};
