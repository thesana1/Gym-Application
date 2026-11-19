import { ArrowRight, Flame, Moon } from 'lucide-react';
import Link from 'next/link';

import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import { WeekRope } from '@/features/training/components/week-rope';
import { summarizeWeek, toDateKey } from '@/features/training/service/training-week.service';
import type { TrainingPlanType } from '@/features/training/validations/training-plan.validation';
import { Button } from '@/shared/components/ui/button';
import { FIELD_BUTTON, FIELD_OUTLINE, Field } from '@/shared/components/ui/field';
import { HOME_COPY } from '@/shared/const/copy-home.const';
import { TRAINING_COPY } from '@/shared/const/copy-training.const';

type TodayWorkoutCardProps = { plan: (TrainingPlanType & { createdAt?: string }) | null; workouts: WorkoutLog[]; now?: Date };

const copy = HOME_COPY.workout;

export const TodayWorkoutCard = ({ plan, workouts, now = new Date() }: TodayWorkoutCardProps) => {
  if (!plan) {
    return (
      <Field aria-labelledby="today-workout">
        <h2 id="today-workout" className="text-4xl leading-none">{copy.noPlanTitle}</h2>
        <p className="text-lg">{copy.noPlan}</p>
        <Button asChild size="lg" className={FIELD_BUTTON}>
          <Link href="/dashboard/workouts">{copy.buildPlan}<ArrowRight className="size-5" aria-hidden="true" /></Link>
        </Button>
      </Field>
    );
  }

  const week = summarizeWeek(plan, workouts, now, plan.createdAt);
  const todayKey = toDateKey(now);
  const today = week.days.find(({ date }) => date === todayKey);
  const next = week.days.find(({ status }) => status === 'upcoming') ?? week.days.find(({ workout, date }) => workout && date !== todayKey);
  const doneToday = workouts.filter(({ completedAt }) => toDateKey(new Date(completedAt)) === todayKey).length;
  const exerciseCount = plan.workouts.find(({ id }) => id === today?.workout?.id)?.exercises.length ?? 0;
  const rope = (
    <div className="flex flex-col gap-2 border-t border-current/15 pt-4">
      <WeekRope days={week.days} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-base font-semibold">{HOME_COPY.week.thisWeek(week.done, week.planned)}</p>
        {week.streakWeeks > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-primary-foreground px-3 py-1 text-base font-bold text-primary">
            <Flame className="size-4" aria-hidden="true" />{TRAINING_COPY.week.streak(week.streakWeeks)}
          </span>
        )}
      </div>
    </div>
  );

  if (today?.workout && today.status === 'today') {
    return (
      <Field aria-labelledby="today-workout">
        <div className="flex flex-col gap-2">
          <h2 id="today-workout" className="text-balance text-4xl leading-none sm:text-5xl">{copy.title(today.workout.name)}</h2>
          <p className="text-lg">{copy.exercises(exerciseCount)}</p>
        </div>
        <Button asChild size="lg" className={FIELD_BUTTON}>
          <Link href={`/dashboard/workouts/${today.workout.id}`}>{copy.start}<ArrowRight className="size-5" aria-hidden="true" /></Link>
        </Button>
        {rope}
      </Field>
    );
  }

  const done = doneToday > 0;
  return (
    <Field aria-labelledby="today-workout">
      <div className="flex flex-col gap-2">
        <h2 id="today-workout" className="flex items-center gap-3 text-4xl leading-none">
          {!done && <Moon className="size-8 shrink-0" aria-hidden="true" />}
          {done ? copy.doneTitle : copy.restTitle}
        </h2>
        <p className="text-lg">
          {done ? copy.done(doneToday) : next?.workout ? copy.next(next.workout.name, TRAINING_COPY.weekdays[next.weekday]) : copy.noDays}
        </p>
      </div>
      <Button asChild variant="outline" className={FIELD_OUTLINE}>
        <Link href={next?.workout || done ? '/dashboard/workouts' : '/dashboard/workouts?tab=plan'}>
          {done ? copy.seeWorkouts : next?.workout ? copy.anyway : copy.pickDays}
        </Link>
      </Button>
      {rope}
    </Field>
  );
};
