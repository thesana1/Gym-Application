import { type ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

type EmptyStateProps = { message: string; action?: ReactNode; className?: string };

// Tells the person what to do next instead of only saying nothing is here.
export const EmptyState = ({ message, action, className }: EmptyStateProps) => (
  <div className={cn('flex flex-col items-start gap-4 rounded-xl border border-dashed border-border bg-card px-4 py-6', className)}>
    <p className="text-base text-muted-foreground">{message}</p>
    {action}
  </div>
);
