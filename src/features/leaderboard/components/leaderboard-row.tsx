import type { LeaderboardEntry } from '@/features/leaderboard/types/leaderboard.types';
import { LEADERBOARD_COPY } from '@/shared/const/copy-leaderboard.const';
import { cn } from '@/shared/lib/utils';

type LeaderboardRowProps = { entry: LeaderboardEntry; value: string };

// The top three get a filled float for their place; everyone else a plain number.
export const LeaderboardRow = ({ entry, value }: LeaderboardRowProps) => (
  <li aria-label={LEADERBOARD_COPY.rowLabel(entry.rank, entry.name, value)} aria-current={entry.isMe ? 'true' : undefined}
    className={cn('flex min-h-14 items-center gap-3 px-4 py-2', entry.isMe && 'bg-primary/30')}>
    <span aria-hidden="true" className={cn('flex size-9 shrink-0 items-center justify-center rounded-full font-heading font-extrabold tabular-nums',
      entry.rank <= 3 ? 'bg-pool text-pool-foreground' : 'text-muted-foreground', entry.rank >= 100 ? 'text-sm' : 'text-base')}>
      {entry.rank}
    </span>
    <span aria-hidden="true" className="min-w-0 flex-1 truncate text-base font-semibold">
      {entry.name}
      {entry.isMe && <span className="ml-2 text-sm font-bold text-primary-ink">{LEADERBOARD_COPY.you}</span>}
    </span>
    <span aria-hidden="true" className="shrink-0 font-heading text-lg font-extrabold tabular-nums tracking-display">{value}</span>
  </li>
);
