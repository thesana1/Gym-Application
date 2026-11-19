import type { AdminDailySignups } from '@/features/admin/types/admin.types';
import { ADMIN_BAR_HEIGHTS } from '@/shared/const/admin.const';
import { ADMIN_COPY } from '@/shared/const/copy-admin.const';
import { cn } from '@/shared/lib/utils';
import { formatDate } from '@/shared/utils/format';

const copy = ADMIN_COPY.signups;

const barHeight = (count: number, max: number) =>
  ADMIN_BAR_HEIGHTS[count === 0 ? 0 : Math.max(1, Math.round((count / max) * (ADMIN_BAR_HEIGHTS.length - 1)))];

export const AdminSignupChart = ({ days }: { days: AdminDailySignups[] }) => {
  const max = Math.max(1, ...days.map((day) => day.count));
  return (
    <section aria-labelledby="admin-signups" className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <h2 id="admin-signups" className="text-xl">{copy.title}</h2>
      <ol className="flex h-40 items-end gap-1 sm:gap-2">
        {days.map((day) => (
          <li key={day.day} className="flex flex-1 flex-col items-center justify-end gap-1"
            aria-label={copy.dayLabel(formatDate(`${day.day}T12:00:00`), day.count)}>
            <span className="text-xs font-bold tabular-nums text-muted-foreground" aria-hidden="true">{day.count || ''}</span>
            <span className={cn('w-full max-w-8 rounded-t-md', barHeight(day.count, max), day.count ? 'bg-pool' : 'bg-muted')} aria-hidden="true" />
          </li>
        ))}
      </ol>
      <p className="flex justify-between text-sm text-muted-foreground" aria-hidden="true">
        <span>{formatDate(`${days[0].day}T12:00:00`)}</span>
        <span>{formatDate(`${days[days.length - 1].day}T12:00:00`)}</span>
      </p>
    </section>
  );
};
