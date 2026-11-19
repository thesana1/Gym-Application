import { cn } from '@/shared/lib/utils';

export type AdminStat = { value: string; label: string };

type AdminStatListProps = { stats: AdminStat[]; className?: string };

// Ruled list of small numbers; inherits its colour so it reads on a Field and on the page.
export const AdminStatList = ({ stats, className }: AdminStatListProps) => (
  <dl className={cn('flex flex-col divide-y divide-current/15 border-t border-current/15', className)}>
    {stats.map((stat) => (
      <div key={stat.label} className="flex items-baseline gap-3 py-2.5">
        <dt className="order-2 text-base opacity-80">{stat.label}</dt>
        <dd className="order-1 min-w-12 font-heading text-2xl font-extrabold tabular-nums tracking-display">{stat.value}</dd>
      </div>
    ))}
  </dl>
);
