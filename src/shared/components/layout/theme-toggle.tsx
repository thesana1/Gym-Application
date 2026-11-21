'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { COMMON_COPY } from '@/shared/const/copy-common.const';
import { cn } from '@/shared/lib/utils';

type ThemeToggleProps = { className?: string };

// Moon in light mode, sun in dark mode. The icons swap with CSS on the `.dark` class, so server and client render the same markup.
// Where the browser supports view transitions, the new theme spreads out in a circle from the top-right corner (see globals.css).
export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggle = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      // Switch the class right away so the view transition captures the new theme; next-themes then saves the choice.
      document.documentElement.classList.toggle('dark', next === 'dark');
      setTheme(next);
    };
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('startViewTransition' in document)) {
      apply();
      return;
    }
    document.startViewTransition(apply);
  };

  return (
    <button type="button" onClick={toggle} aria-label={COMMON_COPY.toggleTheme} title={COMMON_COPY.toggleTheme}
      className={cn('relative inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border',
        'bg-card text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring', className)}>
      <Moon aria-hidden="true"
        className="size-5 rotate-0 scale-100 transition-all duration-500 ease-out dark:-rotate-90 dark:scale-0 dark:opacity-0" />
      <Sun aria-hidden="true"
        className="absolute size-5 rotate-90 scale-0 opacity-0 transition-all duration-500 ease-out dark:rotate-0 dark:scale-100 dark:opacity-100" />
    </button>
  );
};
