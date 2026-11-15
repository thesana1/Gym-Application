import { ChevronDown } from 'lucide-react';
import { type ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

type DisclosureProps = {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

// A tap-to-open section for details most people do not need every day.
export const Disclosure = ({ summary, children, defaultOpen, className }: DisclosureProps) => (
  <details open={defaultOpen} className={cn('group rounded-xl border border-border bg-card', className)}>
    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 text-base font-semibold
      focus-visible:outline-2 focus-visible:outline-ring">
      <span className="min-w-0">{summary}</span>
      <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
    </summary>
    <div className="border-t border-border px-4 py-4">{children}</div>
  </details>
);
