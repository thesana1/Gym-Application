import { CalendarPlus, Check, ChevronRight, Flame, Moon, Play } from 'lucide-react';
import Link from 'next/link';

import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import { summarizeWeek, toDateKey, type DayStatus, type WeekDay } from '@/features/training/service/training-week.service';
import type { TrainingPlanType } from '@/features/training/validations/training-plan.validation';
import { Button } from '@/shared/components/ui/button';
import { TRAINING_COPY } from '@/shared/const/copy-training.const';
import { cn } from '@/shared/lib/utils';

type WeekViewProps = { plan: TrainingPlanType & { createdAt?: string }; logs: WorkoutLog[] };

const copy = TRAINING_COPY.week;

const STATUS_STYLE: Record<DayStatus, string> = {
  done: 'bg-primary text-primary-foreground',
  today: 'bg-primary/15 text-primary',
  missed: 'bg-muted text-muted-foreground',
  upcoming: 'bg-muted text-foreground',
  rest: 'text-muted-foreground',
  extra: 'bg-primary/15 text-primary',
  before: '',
};

const TodayCard = ({ today, next }: { today?: WeekDay; next?: WeekDay }) => {
  if (today?.workout && today.status !== 'done') {
    return (
      <section aria-labelledby="today-title" className="rounded-2xl bg-primary p-5 text-primary-foreground">
        <h2 id="today-title" className="text-base font-semibold text-primary-foreground/85">{copy.today}</h2>
        <p className="mt-1 font-heading text-3xl font-semibold">{today.workout.name}</p>
        <Button asChild size="lg" variant="secondary" className="mt-5 w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
          <Link href={`/dashboard/workouts/${today.workout.id}`}><Play className="size-5" aria-hidden="true" />{copy.start}</Link>
        </Button>
      </section>
    );
  }
  return (
    <section aria-labelledby="today-title" className="rounded-2xl border border-border bg-card p-5">
      <h2 id="today-title" className="flex items-center gap-2 text-xl font-semibold">
        {today?.status === 'done' ? <Check className="size-6 text-primary" aria-hidden="true" /> : <Moon className="size-5 text-primary" aria-hidden="true" />}
        {today?.status === 'done' ? copy.status.done : copy.restToday}
      </h2>
      {next?.workout && <p className="mt-1 text-lg text-muted-foreground">{copy.nextUp(next.workout.name, TRAINING_COPY.weekdays[next.weekday])}</p>}
      {today?.status === 'done' && today.workout && (
        <Button asChild variant="outline" className="mt-4"><Link href={`/dashboard/workouts/${today.workout.id}`}>{copy.doAgain}</Link></Button>
      )}
    </section>
  );
};

export const WeekView = ({ plan, logs }: WeekViewProps) => {
  const week = summarizeWeek(plan, logs, new Date(), plan.createdAt);
  const todayKey = toDateKey(new Date());
  const today = week.days.find(({ date }) => date === todayKey);
  // Next workout: later this week, otherwise the first one next week.
  const next = week.days.find(({ status }) => status === 'upcoming') ?? week.days.find(({ workout, date }) => workout && date !== todayKey);
  const hasDays = week.planned > 0;

  return (
    <div className="flex flex-col gap-4">
      <TodayCard today={today} next={next} />
      {hasDays ? (
        <section aria-labelledby="week-progress" className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="week-progress" className="text-lg font-semibold">{week.done === week.planned ? copy.allDone : copy.progress(week.done, week.planned)}</h2>
            {week.streakWeeks > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-base font-semibold text-primary">
                <Flame className="size-4" aria-hidden="true" />{copy.streak(week.streakWeeks)}
              </span>
            )}
          </div>
          <div className="flex gap-1" aria-hidden="true">
            {Array.from({ length: week.planned }, (_, index) => (
              <span key={index} className={cn('h-3 flex-1 rounded-full transition-colors duration-500', index < week.done ? 'bg-primary' : 'bg-muted')} />
            ))}
          </div>
          <ul className="mt-1 flex flex-col divide-y divide-border">
            {week.days.map((day) => {
              const label = (
                <>
                  <span className="w-12 text-base font-semibold">{TRAINING_COPY.weekdaysShort[day.weekday]}</span>
                  <span className={cn('flex-1 text-base', day.workout ? 'font-medium' : 'text-muted-foreground')}>{day.workout?.name ?? copy.status.rest}</span>
                  {day.status !== 'rest' && day.status !== 'before' && (
                    <span className={cn('flex items-center gap-1 rounded-full px-3 py-1 text-base font-semibold', STATUS_STYLE[day.status])}>
                      {day.status === 'done' && <Check className="size-4" aria-hidden="true" />}{copy.status[day.status]}
                    </span>
                  )}
                </>
              );
              return (
                <li key={day.date}>
                  {day.workout ? (
                    <Link href={`/dashboard/workouts/${day.workout.id}`} aria-label={copy.startLabel(day.workout.name)}
                      className="flex min-h-14 items-center gap-3 py-2 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring">
                      {label}<ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  ) : <div className="flex min-h-14 items-center gap-3 py-2">{label}</div>}
                </li>
              );
            })}
          </ul>
        </section>
      ) : <p className="rounded-2xl border border-dashed border-border p-5 text-base text-muted-foreground">{copy.noDays}</p>}
      {hasDays && (
        <div className="flex flex-col gap-1">
          <Button asChild variant="outline">
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
