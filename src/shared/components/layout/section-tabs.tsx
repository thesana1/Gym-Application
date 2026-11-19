'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NAV_COPY, type SectionTab } from '@/shared/const/navigation.const';
import { cn } from '@/shared/lib/utils';

type SectionTabsProps = { tabs: SectionTab[] };

// Links between sibling pages of one section, drawn as a segmented control.
export const SectionTabs = ({ tabs }: SectionTabsProps) => {
  const pathname = usePathname();
  return (
    <nav aria-label={NAV_COPY.sectionTabsLabel} className="flex gap-1 rounded-full bg-muted p-1">
      {tabs.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined}
            className={cn('flex min-h-11 flex-1 items-center justify-center rounded-full px-3 text-base font-bold',
              'transition-[background-color,color,transform] duration-150 ease-out active:scale-97 focus-visible:outline-2 focus-visible:outline-ring',
              active ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
};
