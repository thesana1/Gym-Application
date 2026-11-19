import { type ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

type PageHeaderProps = {
  title: string;
  description?: string;
  // Section tabs or a single main action shown under the title.
  children?: ReactNode;
  className?: string;
};

export const PageHeader = ({ title, description, children, className }: PageHeaderProps) => (
  <div className={cn('mb-6 flex flex-col gap-4', className)}>
    <div className="flex flex-col gap-1.5">
      <h1 className="text-4xl leading-none lg:text-5xl">{title}</h1>
      {description ? <p className="max-w-prose text-lg text-muted-foreground">{description}</p> : null}
    </div>
    {children}
  </div>
);
