import { ArrowRight, CircleCheck, Dumbbell, Moon, Sparkles } from 'lucide-react';
import Link from 'next/link';

import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import { summarizeWeek, toDateKey } from '@/features/training/service/training-week.service';
import type { TrainingPlanType } from '@/features/training/validations/training-plan.validation';
import { Button } from '@/shared/components/ui/button';
import { HOME_COPY } from '@/shared/const/copy-home.const';
import { TRAINING_COPY } from '@/shared/const/copy-training.const';

type TodayWorkoutCardProps = { plan: (TrainingPlanType & { createdAt?: string }) | null; workouts: WorkoutLog[]; now?: Date };

const copy = HOME_COPY.workout;
const primaryCard = 'rounded-2xl bg-primary p-5 text-primary-foreground';
const primaryButton = 'mt-6 w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90';

export const TodayWorkoutCard = ({ plan, workouts, now = new Date() }: TodayWorkoutCardProps) => {
  if (!plan) {
    return (
      <section aria-labelledby="today-workout" className={primaryCard}>
        <h2 id="today-workout" className="flex items-center gap-2 font-heading text-2xl font-semibold">
          <Sparkles className="size-6" aria-hidden="true" />{copy.noPlanTitle}
        </h2>
        <p className="mt-2 text-lg text-primary-foreground/90">{copy.noPlan}</p>
        <Button asChild size="lg" variant="secondary" className={primaryButton}>
          <Link href="/dashboard/workouts">{copy.buildPlan}<ArrowRight className="size-5" aria-hidden="true" /></Link>
        </Button>
      </section>
    );
  }

  const week = summarizeWeek(plan, workouts, now, plan.createdAt);
  const todayKey = toDateKey(now);
  const today = week.days.find(({ date }) => date === todayKey);
  const next = week.days.find(({ status }) => status === 'upcoming') ?? week.days.find(({ workout, date }) => workout && date !== todayKey);
  const doneToday = workouts.filter(({ completedAt }) => toDateKey(new Date(completedAt)) === todayKey).length;

  if (today?.workout && today.status === 'today') {
    return (
      <section aria-labelledby="today-workout" className={primaryCard}>
        <h2 id="today-workout" className="flex items-center gap-2 text-base font-semibold text-primary-foreground/85">
          <Dumbbell className="size-5" aria-hidden="true" />{copy.title}
        </h2>
        <p className="mt-2 text-balance font-heading text-3xl font-semibold leading-tight">{today.workout.name}</p>
        <Button asChild size="lg" variant="secondary" className={primaryButton}>
          <Link href={`/dashboard/workouts/${today.workout.id}`}>{copy.start}<ArrowRight className="size-5" aria-hidden="true" /></Link>
        </Button>
      </section>
    );
  }

  const done = doneToday > 0;
  return (
    <section aria-labelledby="today-workout" className="rounded-2xl border border-border bg-card p-5">
      <h2 id="today-workout" className="flex items-center gap-2 text-xl font-semibold">
        {done ? <CircleCheck className="size-6 text-primary" aria-hidden="true" /> : <Moon className="size-5 text-primary" aria-hidden="true" />}
        {done ? copy.doneTitle : copy.restTitle}
      </h2>
      <p className="mt-2 text-lg text-muted-foreground">
        {done ? copy.done(doneToday) : next?.workout ? copy.next(next.workout.name, TRAINING_COPY.weekdays[next.weekday]) : copy.noDays}
      </p>
      <Button asChild variant={next?.workout || done ? 'outline' : 'default'} className="mt-5 w-full sm:w-auto">
        <Link href={next?.workout || done ? '/dashboard/workouts' : '/dashboard/workouts?tab=plan'}>
          {done ? copy.seeWorkouts : next?.workout ? copy.anyway : copy.pickDays}
        </Link>
      </Button>
    </section>
  );
};
