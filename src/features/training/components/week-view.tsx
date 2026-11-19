import { CalendarPlus, Check, ChevronRight, Flame, Moon, Play } from 'lucide-react';
import Link from 'next/link';

import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import { WeekRope } from '@/features/training/components/week-rope';
import { summarizeWeek, toDateKey, type DayStatus, type WeekDay } from '@/features/training/service/training-week.service';
import type { TrainingPlanType } from '@/features/training/validations/training-plan.validation';
import { Button } from '@/shared/components/ui/button';
import { FIELD_BUTTON, Field } from '@/shared/components/ui/field';
import { TRAINING_COPY } from '@/shared/const/copy-training.const';
import { cn } from '@/shared/lib/utils';

type WeekViewProps = { plan: TrainingPlanType & { createdAt?: string }; logs: WorkoutLog[] };

const copy = TRAINING_COPY.week;

const STATUS_STYLE: Record<DayStatus, string> = {
  done: 'text-pool',
  today: 'text-foreground',
  missed: 'text-destructive',
  upcoming: 'text-muted-foreground',
  rest: 'text-muted-foreground',
  extra: 'text-pool',
  before: '',
};

const TodayCard = ({ today, next, exerciseCount }: { today?: WeekDay; next?: WeekDay; exerciseCount: number }) => {
  if (today?.workout && today.status !== 'done') {
    return (
      <Field aria-labelledby="today-title">
        <div className="flex flex-col gap-2">
          <h2 id="today-title" className="text-balance text-4xl leading-none sm:text-5xl">{copy.ready(today.workout.name)}</h2>
          <p className="text-lg">{copy.exercises(exerciseCount)}</p>
        </div>
        <Button asChild size="lg" className={FIELD_BUTTON}>
          <Link href={`/dashboard/workouts/${today.workout.id}`}><Play className="size-5" aria-hidden="true" />{copy.start}</Link>
        </Button>
      </Field>
    );
  }
  if (today?.status === 'done') {
    return (
      <Field tone="pool" aria-labelledby="today-title">
        <h2 id="today-title" className="flex items-center gap-3 text-4xl leading-none">
          <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-pool-foreground text-pool">
            <span aria-hidden="true" className="absolute inset-0 animate-ripple rounded-full bg-pool-foreground" />
            <Check className="size-6" aria-hidden="true" />
          </span>
          {copy.doneToday}
        </h2>
        {next?.workout && <p className="text-lg">{copy.nextUp(next.workout.name, TRAINING_COPY.weekdays[next.weekday])}</p>}
        {today.workout && (
          <Button asChild variant="outline"
            className="w-full border-pool-foreground/40 bg-transparent text-pool-foreground hover:bg-pool-foreground/10 sm:w-auto">
            <Link href={`/dashboard/workouts/${today.workout.id}`}>{copy.doAgain}</Link>
          </Button>
        )}
      </Field>
    );
  }
  return (
    <Field aria-labelledby="today-title">
      <h2 id="today-title" className="flex items-center gap-3 text-4xl leading-none">
        <Moon className="size-8 shrink-0" aria-hidden="true" />{copy.restToday}
      </h2>
      {next?.workout && <p className="text-lg">{copy.nextUp(next.workout.name, TRAINING_COPY.weekdays[next.weekday])}</p>}
    </Field>
  );
};

export const WeekView = ({ plan, logs }: WeekViewProps) => {
  const week = summarizeWeek(plan, logs, new Date(), plan.createdAt);
  const todayKey = toDateKey(new Date());
  const today = week.days.find(({ date }) => date === todayKey);
  // Next workout: later this week, otherwise the first one next week.
  const next = week.days.find(({ status }) => status === 'upcoming') ?? week.days.find(({ workout, date }) => workout && date !== todayKey);
  const hasDays = week.planned > 0;
  const exerciseCount = plan.workouts.find(({ id }) => id === today?.workout?.id)?.exercises.length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <TodayCard today={today} next={next} exerciseCount={exerciseCount} />
      {hasDays ? (
        <section aria-labelledby="week-progress" className="flex flex-col gap-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="week-progress" className="text-2xl">{week.done === week.planned ? copy.allDone : copy.progress(week.done, week.planned)}</h2>
            {week.streakWeeks > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1 text-base font-bold text-background">
                <Flame className="size-4 text-primary" aria-hidden="true" />{copy.streak(week.streakWeeks)}
              </span>
            )}
          </div>
          <WeekRope days={week.days} className="rounded-lg bg-card py-4" />
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card px-4">
            {week.days.map((day) => {
              const label = (
                <>
                  <span className="w-11 font-heading text-base font-extrabold">{TRAINING_COPY.weekdaysShort[day.weekday]}</span>
                  <span className={cn('flex-1 text-base', day.workout ? 'font-semibold' : 'text-muted-foreground',
                    day.status === 'done' && 'line-through decoration-pool decoration-2')}>{day.workout?.name ?? copy.status.rest}</span>
                  {day.status !== 'rest' && day.status !== 'before' && (
                    <span className={cn('flex items-center gap-1 text-base font-bold', STATUS_STYLE[day.status])}>
                      {day.status === 'done' && <Check className="size-5" aria-hidden="true" />}{copy.status[day.status]}
                    </span>
                  )}
                </>
              );
              return (
                <li key={day.date}>
                  {day.workout ? (
                    <Link href={`/dashboard/workouts/${day.workout.id}`} aria-label={copy.startLabel(day.workout.name)}
                      className="flex min-h-14 items-center gap-3 py-2 transition-transform duration-150 active:scale-98
                        focus-visible:outline-2 focus-visible:outline-ring">
                      {label}<ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  ) : <div className="flex min-h-14 items-center gap-3 py-2">{label}</div>}
                </li>
              );
            })}
          </ul>
        </section>
      ) : <p className="rounded-lg bg-muted p-5 text-lg font-medium">{copy.noDays}</p>}
      {hasDays && (
        <div className="flex flex-col gap-1">
          <Button asChild variant="ghost" className="self-center">
            <a href="/api/training/calendar" download={TRAINING_COPY.calendar.fileName}>
              <CalendarPlus className="size-5" aria-hidden="true" />{copy.addToCalendar}
            </a>
          </Button>
          <p className="text-center text-base text-muted-foreground">{copy.calendarHelp}</p>
        </div>
      )}
    </div>
  );
};
