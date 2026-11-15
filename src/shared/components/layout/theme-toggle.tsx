'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { cn } from '@/shared/lib/utils';

type ThemeToggleProps = { className?: string };

// Names the mode the tap switches to, so the button always reads as an action.
export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === 'dark';
  const Icon = dark ? Sun : Moon;
  return (
    <button type="button" onClick={() => setTheme(dark ? 'light' : 'dark')}
      className={cn('flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-base font-medium hover:bg-accent',
        'focus-visible:outline-2 focus-visible:outline-ring', className)}>
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      {dark ? COMMON_COPY.lightMode : COMMON_COPY.darkMode}
    </button>
  );
};
