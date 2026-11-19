import type { DayStatus, WeekDay } from '@/features/training/service/training-week.service';
import { TRAINING_COPY } from '@/shared/const/copy-training.const';
import { cn } from '@/shared/lib/utils';

type WeekRopeProps = { days: WeekDay[]; className?: string };

// Done days fill in pool blue; missed days keep a red ring so they stay visible; rest days shrink to a dot.
const FLOAT: Record<DayStatus, string> = {
  done: 'size-7 bg-pool',
  extra: 'size-7 bg-pool',
  today: 'size-7 border-2 border-current bg-card',
  upcoming: 'size-7 border-2 border-current/30',
  missed: 'size-7 border-2 border-destructive',
  rest: 'size-2 bg-current/30',
  before: 'size-2 bg-current/30',
};

export const WeekRope = ({ days, className }: WeekRopeProps) => (
  <ol aria-label={TRAINING_COPY.week.ropeLabel} className={cn('grid grid-cols-7', className)}>
    {days.map((day) => (
      <li key={day.date} className="flex flex-col items-center gap-1.5">
        <span className="flex size-7 items-center justify-center">
          <span className={cn('rounded-full transition-colors duration-300', FLOAT[day.status])} />
        </span>
        <span className={cn('text-sm font-bold', day.status === 'today' ? 'opacity-100' : 'opacity-65')}>
          {TRAINING_COPY.weekdaysShort[day.weekday].slice(0, 1)}
        </span>
        <span className="sr-only">{TRAINING_COPY.week.dayLabel(TRAINING_COPY.weekdays[day.weekday], day.workout?.name, day.status)}</span>
      </li>
    ))}
  </ol>
);
