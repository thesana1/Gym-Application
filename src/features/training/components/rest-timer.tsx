'use client';

import { Timer } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { TRAINING_COPY } from '@/shared/const/copy-training.const';

type RestTimerProps = { seconds: number; startedAt: number; onDone: () => void };

const format = (total: number) => `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;

// Counts down the rest between sets and gives a short buzz on phones that support it.
export const RestTimer = ({ seconds, startedAt, onDone }: RestTimerProps) => {
  const [now, setNow] = useState(() => Date.now());
  const left = Math.max(0, seconds - Math.floor((now - startedAt) / 1000));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (left > 0) return;
    navigator.vibrate?.(200);
    onDone();
  }, [left, onDone]);

  return (
    <div role="timer" aria-live="off" className="flex animate-rise items-center justify-between gap-3 rounded-full bg-foreground py-2 pl-5 pr-2 text-background
      shadow-lg">
      <span className="flex items-center gap-2 font-heading text-3xl font-extrabold font-stretch-condensed">
        <Timer className="size-6" aria-hidden="true" />{TRAINING_COPY.session.restLeft(format(left))}
      </span>
      <Button type="button" size="sm" onClick={onDone}>{TRAINING_COPY.session.skipRest}</Button>
    </div>
  );
};
