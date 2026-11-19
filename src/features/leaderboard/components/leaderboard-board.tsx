import Link from 'next/link';

import { LeaderboardRow } from '@/features/leaderboard/components/leaderboard-row';
import type { Leaderboard } from '@/features/leaderboard/types/leaderboard.types';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { FIELD_BUTTON, Field } from '@/shared/components/ui/field';
import { LEADERBOARD_COPY } from '@/shared/const/copy-leaderboard.const';
import { LEADERBOARD_EMPTY_LINKS, LEADERBOARD_LIMITS, type LeaderboardKind } from '@/shared/const/leaderboard.const';

type LeaderboardBoardProps = { kind: LeaderboardKind; board: Leaderboard };

export const LeaderboardBoard = ({ kind, board }: LeaderboardBoardProps) => {
  const copy = LEADERBOARD_COPY.boards[kind];
  const format = (value: number) => copy.value(value);
  const { me } = board;
  const meOutsideTop = me !== null && !board.entries.some((entry) => entry.isMe);

  return (
    <div className="flex flex-col gap-5">
      <Field aria-labelledby={`${kind}-place`}>
        {me ? (
          <>
            <h2 id={`${kind}-place`} className="text-xl">{LEADERBOARD_COPY.yourPlace}</h2>
            <p className="flex items-baseline gap-3">
              <span className="font-heading text-7xl font-extrabold leading-none tabular-nums tracking-display">{LEADERBOARD_COPY.place(me.rank)}</span>
              <span className="text-lg">{LEADERBOARD_COPY.of(board.total)}</span>
            </p>
            <p className="text-lg font-semibold">{copy.yourScore(format(me.value))}</p>
          </>
        ) : (
          <>
            <h2 id={`${kind}-place`} className="text-2xl">{copy.emptyTitle}</h2>
            <p className="text-lg">{copy.empty}</p>
            <Button asChild className={FIELD_BUTTON}><Link href={LEADERBOARD_EMPTY_LINKS[kind]}>{copy.emptyAction}</Link></Button>
          </>
        )}
      </Field>

      <section aria-labelledby={`${kind}-list`} className="flex flex-col gap-3">
        <h2 id={`${kind}-list`} className="text-xl">{copy.title}</h2>
        {board.entries.length === 0 ? (
          <EmptyState message={copy.nobody} />
        ) : (
          <ol aria-label={LEADERBOARD_COPY.topLabel(LEADERBOARD_LIMITS.topSize)}
            className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {board.entries.map((entry, index) => <LeaderboardRow key={index} entry={entry} value={format(entry.value)} />)}
            {meOutsideTop && (
              <>
                <li className="px-4 py-2 text-center text-sm text-muted-foreground">{LEADERBOARD_COPY.outsideTop}</li>
                <LeaderboardRow entry={me} value={format(me.value)} />
              </>
            )}
          </ol>
        )}
        <p className="text-base text-muted-foreground">{copy.how}</p>
      </section>
    </div>
  );
};
