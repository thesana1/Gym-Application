'use client';

import { Tabs as TabsPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

const Tabs = TabsPrimitive.Root;

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn('flex gap-1 rounded-xl bg-muted p-1', className)} {...props} />;
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'flex min-h-11 flex-1 items-center justify-center rounded-lg px-2 text-base font-semibold text-muted-foreground transition-colors',
        'hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring',
        'aria-selected:bg-card aria-selected:text-foreground aria-selected:shadow-sm',
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('mt-6 outline-none', className)} {...props} />;
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
