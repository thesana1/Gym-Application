import { type ComponentProps } from 'react';

import { cn } from '@/shared/lib/utils';

type FieldProps = ComponentProps<'section'> & { tone?: 'sun' | 'pool' };

// The one big coloured region on a screen: chartreuse for the next thing to do, teal once it is done.
export const Field = ({ tone = 'sun', className, ...props }: FieldProps) => (
  <section className={cn('flex flex-col gap-5 rounded-3xl p-6', tone === 'sun' ? 'bg-primary text-primary-foreground' : 'bg-pool text-pool-foreground',
    className)} {...props} />
);

// Ink button that sits on a Field.
export const FIELD_BUTTON = 'w-full bg-primary-foreground text-primary shadow-none hover:bg-primary-foreground/85 sm:w-auto';
// Quieter outline button that sits on a Field and keeps the Field's own ink in light and dark mode.
export const FIELD_OUTLINE = 'w-full border-current/30 bg-transparent text-current hover:bg-current/10 sm:w-auto';
