import * as React from 'react';

import { cn } from '@/shared/lib/utils';

// The phone's own picker is the easiest list to use, so this styles the native select.
function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      data-slot="select"
      className={cn(
        'flex h-12 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-base font-normal text-foreground',
        'focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  );
}

export { Select };
