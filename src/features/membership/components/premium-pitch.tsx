'use client';

import { CircleCheck, Loader2, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { PremiumComparison } from '@/features/membership/components/premium-comparison';
import { useBilling } from '@/features/membership/hooks/use-billing';
import { Button } from '@/shared/components/ui/button';
import { PREMIUM_PITCH_COPY } from '@/shared/const/copy-premium.const';
import { BILLING_PRODUCTS } from '@/shared/const/membership-payments.const';

type PremiumPitchProps = { goal?: string; trainingDays?: number };

const copy = PREMIUM_PITCH_COPY;
const money = (dollars: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(dollars);
const MONTHLY = BILLING_PRODUCTS.premium.price / 100;
// Rough daily cost over an average 30-day month, to show the price in everyday terms.
const DAILY = Math.round((MONTHLY / 30) * 100) / 100;

export const PremiumPitch = ({ goal, trainingDays }: PremiumPitchProps) => {
  const router = useRouter();
  const { access, busy, error, runAction } = useBilling(false);
  const buying = busy === 'premium';

  useEffect(() => {
    if (access?.plan === 'premium') router.replace('/dashboard');
  }, [access, router]);

  const continueFree = () => {
    router.refresh();
    router.push('/dashboard');
  };

  return (
    <>
      <div className="flex max-w-2xl animate-rise flex-col gap-6 pb-48 lg:pb-0">

        <header className="flex flex-col gap-2">
          <h1 className="text-balance text-4xl">{copy.title}</h1>
          <p className="text-lg text-muted-foreground">{copy.subtitle}</p>
          <p className="flex items-center gap-2 text-base font-bold text-pool">
            <CircleCheck className="size-5 animate-pop" aria-hidden="true" />{goal ? copy.readyGoal(goal) : copy.ready}
          </p>
        </header>

        {trainingDays && <p className="rounded-3xl bg-primary/25 p-4 text-lg font-medium">{copy.commitment(trainingDays)}</p>}

        <section aria-labelledby="benefits-title" className="flex flex-col gap-3">
          <h2 id="benefits-title" className="text-2xl">{copy.benefitsTitle}</h2>
          <dl className="flex flex-col">
            {copy.benefits.map(({ title, body }) => (
              <div key={title} className="flex flex-col gap-1 border-t border-border py-4">
                <dt className="font-heading text-xl font-extrabold tracking-display">{title}</dt>
                <dd className="text-base text-muted-foreground">{body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <PremiumComparison />

        <p className="flex items-center gap-2 text-base font-medium">
          <ShieldCheck className="size-5 shrink-0 text-primary-ink" aria-hidden="true" />{copy.cancelAnyTime}
        </p>
      </div>

      {/* Outside the animated block: a transformed parent would stop this bar sticking to the screen. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-4 pb-4 pt-3 backdrop-blur
        lg:static lg:border-0 lg:bg-transparent lg:p-0">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
          {error && <p role="alert" className="text-base text-destructive">{error}</p>}
          <div className="flex items-baseline justify-between gap-2">
            <span className="whitespace-nowrap font-heading text-xl font-extrabold tabular-nums">{copy.price(money(MONTHLY))}</span>
            <span className="whitespace-nowrap text-base text-muted-foreground">{copy.perDay(money(DAILY))}</span>
          </div>
          <Button size="lg" className="w-full" disabled={!!busy || !access} onClick={() => void runAction('premium')}>
            {buying && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}{buying ? copy.starting : copy.start}
          </Button>
          <Button variant="ghost" className="w-full" onClick={continueFree}>{copy.continueFree}</Button>
          <p className="text-center text-sm text-muted-foreground">{copy.cancelAnyTime} {copy.taxNote}</p>
        </div>
      </div>
    </>
  );
};
