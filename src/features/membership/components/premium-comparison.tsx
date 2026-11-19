import { Check, Minus } from 'lucide-react';

import { PREMIUM_PITCH_COPY } from '@/shared/const/copy-premium.const';
import { cn } from '@/shared/lib/utils';

const copy = PREMIUM_PITCH_COPY;

const Cell = ({ value, highlight }: { value: boolean | string; highlight?: boolean }) => {
  if (typeof value === 'string') {
    return <span className={cn('font-heading text-xl font-extrabold tabular-nums', highlight && 'text-primary-ink')}>{value}</span>;
  }
  return value
    ? <Check className={cn('size-6', highlight ? 'text-primary-ink' : 'text-foreground')} aria-label={copy.included} />
    : <Minus className="size-6 text-muted-foreground" aria-label={copy.notIncluded} />;
};

export const PremiumComparison = () => (
  <section aria-labelledby="compare-title" className="flex flex-col gap-3">
    <h2 id="compare-title" className="text-2xl">{copy.compareTitle}</h2>
    <table className="w-full table-fixed border-separate border-spacing-0 overflow-hidden rounded-lg border border-border bg-card text-base">
      <thead>
        <tr>
          <th scope="col" className="w-1/2 p-3 text-left font-medium text-muted-foreground">{copy.feature}</th>
          <th scope="col" className="p-3 text-center font-semibold">{copy.free}</th>
          <th scope="col" className="bg-primary p-3 text-center font-semibold text-primary-foreground">{copy.premium}</th>
        </tr>
      </thead>
      <tbody>
        {copy.rows.map((row) => (
          <tr key={row.label}>
            <th scope="row" className="border-t border-border p-3 text-left font-medium">
              {row.label}
              {'help' in row && <span className="mt-1 block text-sm font-normal text-muted-foreground">{row.help}</span>}
            </th>
            <td className="border-t border-border p-3 text-center"><span className="inline-flex justify-center"><Cell value={row.free} /></span></td>
            <td className="border-t border-primary/20 bg-primary/25 p-3 text-center">
              <span className="inline-flex justify-center"><Cell value={row.premium} highlight /></span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);
