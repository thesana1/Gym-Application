import { ArrowRight, CircleCheck, Dumbbell, Moon } from 'lucide-react';
import Link from 'next/link';

import type { TrainingScheduleAssignment } from '@/features/fitness/service/training-schedule.service';
import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import { Button } from '@/shared/components/ui/button';
import { HOME_COPY } from '@/shared/const/copy-home.const';
import { WEEKDAYS } from '@/shared/const/weekdays.const';

type TodayWorkoutCardProps = {
  workouts: WorkoutLog[];
  assignments: Pick<TrainingScheduleAssignment, 'weekday' | 'sessionIndex' | 'sessionTitle'>[];
  today?: number;
};

const copy = HOME_COPY.workout;

// The next assigned session after today, counting forward through the week.
const findNext = (assignments: TodayWorkoutCardProps['assignments'], today: number) =>
  [...assignments].sort((a, b) => ((a.weekday - today + 7) % 7 || 7) - ((b.weekday - today + 7) % 7 || 7))[0];

export const TodayWorkoutCard = ({ workouts, assignments, today = new Date().getDay() }: TodayWorkoutCardProps) => {
  const planned = assignments.find(({ weekday }) => weekday === today);
  const next = findNext(assignments.filter(({ weekday }) => weekday !== today), today);

  if (workouts.length > 0) {
    return (
      <section aria-labelledby="today-workout" className="rounded-2xl border border-border bg-card p-5">
        <h2 id="today-workout" className="flex items-center gap-2 text-xl font-semibold">
          <CircleCheck className="size-6 text-primary" aria-hidden="true" />{copy.doneTitle}
        </h2>
        <p className="mt-2 text-lg text-muted-foreground">{copy.done(workouts.length)}</p>
        <Button asChild variant="outline" className="mt-5 w-full sm:w-auto">
          <Link href="/dashboard/workouts">{copy.seeWorkouts}</Link>
        </Button>
      </section>
    );
  }

  if (planned) {
    return (
      <section aria-labelledby="today-workout" className="rounded-2xl bg-primary p-5 text-primary-foreground">
        <h2 id="today-workout" className="flex items-center gap-2 text-base font-semibold text-primary-foreground/85">
          <Dumbbell className="size-5" aria-hidden="true" />{copy.title}
        </h2>
        <p className="mt-2 text-balance font-heading text-3xl font-semibold leading-tight">{planned.sessionTitle}</p>
        <Button asChild size="lg" variant="secondary" className="mt-6 w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
          <Link href={`/dashboard/workouts?session=${planned.sessionIndex}`}>
            {copy.start}<ArrowRight className="size-5" aria-hidden="true" />
          </Link>
        </Button>
      </section>
    );
  }

  return (
    <section aria-labelledby="today-workout" className="rounded-2xl border border-border bg-card p-5">
      <h2 id="today-workout" className="flex items-center gap-2 text-xl font-semibold">
        <Moon className="size-5 text-primary" aria-hidden="true" />{copy.restTitle}
      </h2>
      <p className="mt-2 text-lg text-muted-foreground">
        {next ? copy.next(next.sessionTitle, WEEKDAYS[next.weekday].label) : copy.noDays}
      </p>
      <Button asChild variant={next ? 'outline' : 'default'} className="mt-5 w-full sm:w-auto">
        <Link href={next ? '/dashboard/workouts' : '/dashboard/workouts?tab=plan'}>{next ? copy.anyway : copy.pickDays}</Link>
      </Button>
    </section>
  );
};
