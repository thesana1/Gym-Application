'use client';

import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';

import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';

type PasswordInputProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  showText: string;
  hideText: string;
  showLabel: string;
  hideLabel: string;
};

// Lets people check what they typed, with a worded button instead of an icon alone.
function PasswordInput({ className, showText, hideText, showLabel, hideLabel, ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} className={cn('pr-24', className)} {...props} />
      <button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? hideLabel : showLabel} aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex min-w-20 items-center justify-center gap-1 rounded-r-lg px-3 text-base font-medium text-muted-foreground
          hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
        <Icon className="size-4" aria-hidden="true" />{visible ? hideText : showText}
      </button>
    </div>
  );
}

export { PasswordInput };
