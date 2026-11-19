'use client';

import { ArrowLeft, Flag } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { RestTimer } from '@/features/training/components/rest-timer';
import { SessionExerciseCard, type SessionForm } from '@/features/training/components/session-exercise-card';
import { WorkoutFinish, type FinishedExercise } from '@/features/training/components/workout-finish';
import { useWorkoutSession } from '@/features/training/hooks/use-workout-session';
import type { WorkoutSession as Session } from '@/features/training/service/training-plan.service';
import { Button } from '@/shared/components/ui/button';
import { LaneRope } from '@/shared/components/ui/lane-rope';
import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { TRAINING_COPY } from '@/shared/const/copy-training.const';

const copy = TRAINING_COPY.session;
const WHOLE = /^\d{1,3}$/;
const DECIMAL = /^\d{1,3}([.,]\d{1,2})?$/;

const toForm = (session: Session): SessionForm => ({
  exercises: session.exercises.map(({ exerciseId, sets, target }) => ({
    exerciseId,
    sets: Array.from({ length: sets }, () => ({ reps: '', kg: target.weightKg ? String(target.weightKg) : '', done: false })),
  })),
});

const SessionBody = ({ session, onFinished, complete }: {
  session: Session; complete: ReturnType<typeof useWorkoutSession>['complete']; onFinished: (result: FinishedExercise[], minutes: number) => void;
}) => {
  const [startedAt] = useState(() => Date.now());
  const [rest, setRest] = useState<{ seconds: number; startedAt: number } | null>(null);
  const [missing, setMissing] = useState<{ exercise: number; set: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<SessionForm>({ defaultValues: toForm(session) });
  const exercises = useWatch({ control: form.control, name: 'exercises' });
  const total = exercises.reduce((sum, item) => sum + item.sets.length, 0);
  const done = exercises.reduce((sum, item) => sum + item.sets.filter((set) => set.done).length, 0);
  const endRest = useCallback(() => setRest(null), []);

  const toggle = (exerciseIndex: number, setIndex: number) => {
    const path = `exercises.${exerciseIndex}.sets.${setIndex}` as const;
    // getValues returns the live form object, so read the flag before setValue changes it.
    const { done: wasDone, reps } = form.getValues(path);
    if (!wasDone && !WHOLE.test(reps.trim())) {
      setMissing({ exercise: exerciseIndex, set: setIndex });
      return;
    }
    setMissing(null);
    form.setValue(`${path}.done`, !wasDone);
    if (!wasDone) setRest({ seconds: session.exercises[exerciseIndex].restSeconds, startedAt: Date.now() });
  };

  const finish = async (early: boolean) => {
    if (done === 0) return setError(copy.noSetsDone);
    if (early && !window.confirm(copy.confirmEarly)) return;
    const result: FinishedExercise[] = form.getValues('exercises').flatMap((item, index) => {
      const sets = item.sets.filter((set) => set.done && WHOLE.test(set.reps.trim())).map((set) => {
        const kg = set.kg.trim().replace(',', '.');
        return { repetitions: Number(set.reps), ...(DECIMAL.test(set.kg.trim()) && Number(kg) > 0 ? { weightKg: Number(kg) } : {}) };
      });
      return sets.length ? [{ exercise: session.exercises[index], sets }] : [];
    });
    setSaving(true);
    setError(null);
    try {
      await complete({
        title: session.workout.name, planWorkoutId: session.workout.id,
        exercises: result.map(({ exercise, sets }) => ({ exerciseId: exercise.exerciseId, sets })),
      });
      onFinished(result, Math.max(1, Math.round((Date.now() - startedAt) / 60000)));
    } catch {
      setError(copy.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2" role="status" aria-label={copy.progress(done, total)}>
        <p className="font-heading text-lg font-extrabold">{copy.progress(done, total)}</p>
        <LaneRope total={total} filled={done} label={copy.progress(done, total)} current={done} size={total > 16 ? 'sm' : 'md'} className="flex-wrap" />
      </div>
      {session.exercises.map((exercise, index) => (
        <SessionExerciseCard key={exercise.exerciseId} index={index} exercise={exercise} control={form.control} register={form.register}
          missingReps={missing?.exercise === index ? missing.set : null} onToggle={(setIndex) => toggle(index, setIndex)} />
      ))}
      {error && <p role="alert" className="text-base text-destructive">{error}</p>}
      <div className="sticky bottom-24 z-10 flex flex-col gap-2 lg:bottom-4">
        {rest && <RestTimer seconds={rest.seconds} startedAt={rest.startedAt} onDone={endRest} />}
        {done === total ? (
          <Button size="lg" className="w-full shadow-lg" disabled={saving} onClick={() => void finish(false)}>
            <Flag className="size-5" aria-hidden="true" />{saving ? copy.saving : copy.complete}
          </Button>
        ) : (
          <Button size="lg" variant="outline" className="w-full bg-card shadow-lg" disabled={saving || done === 0} onClick={() => void finish(true)}>
            {saving ? copy.saving : copy.completeEarly}
          </Button>
        )}
      </div>
    </div>
  );
};

export const WorkoutSession = ({ workoutId }: { workoutId: string }) => {
  const { session, records, loading, error, load, complete } = useWorkoutSession(workoutId);
  const [finished, setFinished] = useState<{ result: FinishedExercise[]; minutes: number } | null>(null);

  const back = (
    <Button asChild variant="ghost" className="-ml-3 mb-2 w-fit">
      <Link href="/dashboard/workouts"><ArrowLeft className="size-5" aria-hidden="true" />{copy.back}</Link>
    </Button>
  );
  if (loading) return <div className="h-96 max-w-2xl animate-pulse rounded-lg bg-muted" role="status" aria-label={copy.loading} />;
  if (error || !session) {
    return (
      <div className="flex flex-col items-start gap-3">
        {back}
        <p role="alert" className="text-base text-destructive">{error ?? copy.notFound}</p>
        <Button variant="outline" onClick={() => void load()}>{COMMON_COPY.tryAgain}</Button>
      </div>
    );
  }
  if (finished) return <WorkoutFinish workoutName={session.workout.name} result={finished.result} minutes={finished.minutes} records={records} />;

  return (
    <div className="max-w-2xl animate-rise">
      {back}
      <h1 className="mb-5 text-balance text-4xl leading-none">{session.workout.name}</h1>
      <SessionBody session={session} complete={complete} onFinished={(result, minutes) => { setFinished({ result, minutes }); window.scrollTo({ top: 0 }); }} />
    </div>
  );
};
