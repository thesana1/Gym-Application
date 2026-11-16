import { Check, Loader2 } from 'lucide-react';
import { type ReactNode } from 'react';

import { Button } from '@/shared/components/ui/button';
import { PLAN_COPY } from '@/shared/const/copy-account.const';
import { BILLING_PRODUCTS, PREMIUM_BENEFITS } from '@/shared/const/membership-payments.const';

type PremiumOfferProps = { title?: string; busy: boolean; disabled: boolean; onGet: () => void; children?: ReactNode };

const copy = PLAN_COPY;
const formatPrice = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

export const PremiumOffer = ({ title = copy.premiumTitle, busy, disabled, onGet, children }: PremiumOfferProps) => (
  <section aria-labelledby="premium-title" className="flex flex-col gap-4 rounded-2xl border-2 border-primary bg-card p-5">
    <div>
      <h2 id="premium-title" className="text-2xl font-semibold">{title}</h2>
      <p className="mt-1 font-heading text-3xl font-semibold tabular-nums">
        {formatPrice(BILLING_PRODUCTS.premium.price)}<span className="ml-1 text-lg font-normal text-muted-foreground">{copy.perMonth}</span>
      </p>
    </div>
    <h3 className="text-base font-semibold">{copy.includes}</h3>
    <ul className="flex flex-col gap-2">
      {PREMIUM_BENEFITS.map((benefit) => (
        <li key={benefit} className="flex gap-2 text-lg"><Check className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />{benefit}</li>
      ))}
    </ul>
    <Button size="lg" disabled={disabled} onClick={onGet}>
      {busy && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}{copy.get}
    </Button>
    {children}
    <p className="text-base text-muted-foreground">{copy.renewNote}</p>
  </section>
);
