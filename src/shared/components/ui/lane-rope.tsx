'use client';

import { useState } from 'react';

import { cn } from '@/shared/lib/utils';

type LaneRopeProps = {
  total: number;
  filled: number;
  label: string;
  // Marks one float as "now" (today, the next set) with a chartreuse ring.
  current?: number;
  size?: 'sm' | 'md' | 'lg';
  // The real amount the floats stand for (for example 750 of 2000 kcal), read out by screen readers.
  value?: { now: number; max: number };
  className?: string;
};

const SIZES = { sm: 'size-3', md: 'size-5', lg: 'size-8' } as const;

// The app's signature: a lane rope of round floats that fill in teal one by one.
// When a float fills while the person watches, it sends out one ripple.
export const LaneRope = ({ total, filled, label, current, size = 'md', value, className }: LaneRopeProps) => {
  const shown = Math.max(0, Math.min(total, filled));
  // Remember the last count so a newly filled float can ripple (React's "adjust state while rendering" pattern).
  const [previous, setPrevious] = useState(shown);
  const [rippleAt, setRippleAt] = useState<number | null>(null);
  if (shown !== previous) {
    setPrevious(shown);
    setRippleAt(shown > previous ? shown - 1 : null);
  }

  return (
    <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={value?.max ?? total} aria-valuenow={value?.now ?? shown}
      className={cn('flex items-center', size === 'lg' ? 'gap-2' : 'gap-1.5', className)}>
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className={cn('relative shrink-0 rounded-full transition-colors duration-300', SIZES[size],
          index < shown ? 'bg-pool' : 'border-2 border-pool/25 bg-card',
          index === current && index >= shown && 'border-primary-ink bg-primary')}>
          {index === rippleAt && (
            <span key={`ripple-${shown}`} aria-hidden="true" className="absolute inset-0 animate-ripple rounded-full bg-pool" />
          )}
        </span>
      ))}
    </div>
  );
};
