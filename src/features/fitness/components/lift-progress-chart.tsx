import type { LiftProgress } from '@/features/fitness/service/lift-progress.service';
import { PROGRESS_COPY } from '@/shared/const/copy-progress.const';

const copy = PROGRESS_COPY.strength;
const WIDTH = 320;
const HEIGHT = 180;
const PAD = { top: 24, right: 16, bottom: 28, left: 40 };

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`));

// Pads the y-range so a flat line still sits in the middle of the graph.
const yRange = (values: number[]) => {
  const low = Math.min(...values);
  const high = Math.max(...values);
  const pad = high === low ? Math.max(1, high * 0.1) : (high - low) * 0.15;
  return { low: Math.max(0, low - pad), high: high + pad };
};

export const LiftProgressChart = ({ lift }: { lift: LiftProgress }) => {
  const values = lift.points.map(({ value }) => value);
  const { low, high } = yRange(values);
  const innerWidth = WIDTH - PAD.left - PAD.right;
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  const x = (index: number) => PAD.left + (lift.points.length === 1 ? innerWidth / 2 : (index / (lift.points.length - 1)) * innerWidth);
  const y = (value: number) => PAD.top + innerHeight - ((value - low) / (high - low)) * innerHeight;
  const coords = lift.points.map(({ value }, index) => ({ cx: x(index), cy: y(value), value }));
  const line = coords.map(({ cx, cy }) => `${cx},${cy}`).join(' ');
  const baseline = PAD.top + innerHeight;
  const area = `${coords[0].cx},${baseline} ${line} ${coords.at(-1)?.cx},${baseline}`;
  const bestIndex = values.lastIndexOf(lift.best);
  const best = coords[bestIndex];
  const gridValues = [lift.best, (lift.best + Math.min(...values)) / 2, Math.min(...values)];
  const gradientId = `lift-fill-${lift.exerciseId}`;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full text-pool" role="img"
      aria-label={copy.chartLabel(lift.exerciseName, lift.points.length, lift.first, lift.best, lift.unit)}>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[...new Set(gridValues)].map((value) => (
        <g key={value}>
          <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(value)} y2={y(value)} className="stroke-border" strokeDasharray="4 4" />
          <text x={PAD.left - 8} y={y(value) + 4} textAnchor="end" className="fill-muted-foreground text-xs tabular-nums">
            {Number.isInteger(value) ? value : value.toFixed(1)}
          </text>
        </g>
      ))}
      {coords.length > 1 && <polygon points={area} fill={`url(#${gradientId})`} className="animate-rise" />}
      {coords.length > 1 && (
        <polyline points={line} pathLength={1} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
          strokeLinejoin="round" className="animate-draw" />
      )}
      {coords.map(({ cx, cy, value }, index) => (
        <circle key={`${index}-${value}`} cx={cx} cy={cy} r={index === bestIndex ? 0 : 3.5} className="fill-card" stroke="currentColor"
          strokeWidth="2" />
      ))}
      <circle cx={best.cx} cy={best.cy} r="11" fill="currentColor" opacity="0.2" className="origin-center transform-fill animate-pop" />
      <circle cx={best.cx} cy={best.cy} r="6" fill="currentColor" className="origin-center transform-fill animate-pop" />
      <text x={Math.min(Math.max(best.cx, PAD.left + 16), WIDTH - PAD.right - 16)} y={Math.max(best.cy - 16, 12)} textAnchor="middle"
        className="fill-pool text-xs font-semibold">
        {copy.bestMark}
      </text>
      <text x={PAD.left} y={HEIGHT - 6} className="fill-muted-foreground text-xs">{formatDate(lift.points[0].date)}</text>
      {lift.points.length > 1 && (
        <text x={WIDTH - PAD.right} y={HEIGHT - 6} textAnchor="end" className="fill-muted-foreground text-xs">
          {formatDate(lift.points.at(-1)?.date ?? '')}
        </text>
      )}
    </svg>
  );
};
