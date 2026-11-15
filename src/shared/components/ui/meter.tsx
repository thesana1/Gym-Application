import { cn } from '@/shared/lib/utils';

const SEGMENTS = 10;

type MeterProps = {
  label: string;
  value: number;
  target?: number | null;
  unit: string;
  className?: string;
};

const format = (value: number) => Math.round(value).toLocaleString();

// Segmented indigo meter: one segment per tenth of the target the person set.
export const Meter = ({ label, value, target, unit, className }: MeterProps) => {
  const filled = target && target > 0 ? Math.min(SEGMENTS, Math.round((value / target) * SEGMENTS)) : 0;
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-base font-medium">{label}</span>
        <span className="text-base tabular-nums text-muted-foreground">
          <span className="font-semibold text-foreground">{format(value)}</span>
          {target ? ` / ${format(target)}` : ''} {unit}
        </span>
      </div>
      {target ? (
        <div className="grid grid-cols-10 gap-1" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={target} aria-valuenow={value}>
          {Array.from({ length: SEGMENTS }, (_, index) => (
            <span key={index} className={cn('h-2.5 rounded-full', index < filled ? 'bg-primary' : 'bg-muted')} />
          ))}
        </div>
      ) : null}
    </div>
  );
};
