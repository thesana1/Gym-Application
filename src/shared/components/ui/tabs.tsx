'use client';

import { Tabs as TabsPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

const Tabs = TabsPrimitive.Root;

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn('flex gap-1 rounded-full bg-muted p-1', className)} {...props} />;
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'flex min-h-11 flex-1 items-center justify-center rounded-full px-3 text-base font-bold text-muted-foreground',
        'transition-[background-color,color,transform] duration-150 ease-out active:scale-97',
        'hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring',
        'aria-selected:bg-foreground aria-selected:text-background',
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
