import { type ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

type EmptyStateProps = { message: string; action?: ReactNode; className?: string };

// Tells the person what to do next instead of only saying nothing is here.
export const EmptyState = ({ message, action, className }: EmptyStateProps) => (
  <div className={cn('flex flex-col items-start gap-4 rounded-lg bg-muted px-4 py-5', className)}>
    <p className="max-w-prose text-lg font-medium">{message}</p>
    {action}
  </div>
);
