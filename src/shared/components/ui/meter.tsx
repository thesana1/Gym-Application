import { LaneRope } from '@/shared/components/ui/lane-rope';
import { cn } from '@/shared/lib/utils';

const FLOATS = 10;

type MeterProps = {
  label: string;
  value: number;
  target?: number | null;
  unit: string;
  className?: string;
};

const format = (value: number) => Math.round(value).toLocaleString();

// A lane rope of ten floats: each one is a tenth of the target the person set.
export const Meter = ({ label, value, target, unit, className }: MeterProps) => {
  const filled = target && target > 0 ? Math.min(FLOATS, Math.round((value / target) * FLOATS)) : 0;
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-base font-semibold">{label}</span>
        <span className="text-base text-muted-foreground">
          <span className="font-heading text-lg font-extrabold text-foreground">{format(value)}</span>
          {target ? ` / ${format(target)}` : ''} {unit}
        </span>
      </div>
      {target ? <LaneRope total={FLOATS} filled={filled} label={label} size="sm" value={{ now: value, max: target }} className="justify-between" /> : null}
    </div>
  );
};
