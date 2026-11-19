'use client';

import { Check, RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { LANDING_COPY } from '@/shared/const/copy-public.const';
import { cn } from '@/shared/lib/utils';

const copy = LANDING_COPY.demo;

// A working slice of the real workout checklist: tap each set and its float fills.
export const LandingDemo = () => {
  const [done, setDone] = useState<boolean[]>(() => copy.sets.map(() => false));
  const count = done.filter(Boolean).length;
  const finished = count === done.length;

  return (
    <figure aria-label={copy.label} className="relative flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-xl shadow-primary-ink/10 sm:p-6">
      <figcaption className="absolute -top-3 right-5 rounded-full bg-foreground px-3 py-1 text-sm font-bold text-background">{copy.tag}</figcaption>
      <div>
        <p className="font-heading text-2xl font-extrabold tracking-display">{copy.exercise}</p>
        <p className="text-base text-muted-foreground">{copy.target}</p>
      </div>
      <ul className="flex flex-col divide-y divide-border">
        {copy.sets.map((set, index) => (
          <li key={set} className="flex min-h-16 items-center justify-between gap-3">
            <span className={cn('font-heading text-lg font-extrabold', done[index] && 'text-pool')}>{set}</span>
            <button type="button" aria-pressed={done[index]} aria-label={copy.tapLabel(set)}
              onClick={() => setDone((current) => current.map((value, at) => (at === index ? !value : value)))}
              className="rounded-full focus-visible:outline-2 focus-visible:outline-ring">
              <span className={cn('relative flex size-12 items-center justify-center rounded-full border-2',
                'transition-[background-color,border-color,transform] duration-200 ease-out active:scale-90',
                done[index] ? 'border-pool bg-pool text-pool-foreground' : 'border-pool/35 text-pool/50 hover:border-pool')}>
                {done[index] && <span aria-hidden="true" className="absolute inset-0 animate-ripple rounded-full bg-pool" />}
                <Check className="size-6" aria-hidden="true" />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p role="status" className={cn('flex min-h-12 items-center justify-between gap-3 rounded-full px-4 font-bold transition-colors duration-300',
        finished ? 'bg-pool text-pool-foreground' : 'bg-muted text-muted-foreground')}>
        {finished ? copy.finished : copy.progress(count, done.length)}
        {finished && (
          <button type="button" onClick={() => setDone(done.map(() => false))}
            className="flex min-h-11 items-center gap-1 rounded-full px-2 focus-visible:outline-2 focus-visible:outline-ring">
            <RotateCcw className="size-4" aria-hidden="true" />{copy.again}
          </button>
        )}
      </p>
    </figure>
  );
};
