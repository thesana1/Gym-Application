'use client';

import { Check, CreditCard, Loader2, RefreshCw } from 'lucide-react';

import { useBilling } from '@/features/membership/hooks/use-billing';
import { PageHeader } from '@/shared/components/layout/page-header';
import { Button } from '@/shared/components/ui/button';
import { PLAN_COPY } from '@/shared/const/copy-account.const';
import { BILLING_PRODUCTS, PREMIUM_BENEFITS } from '@/shared/const/membership-payments.const';

type MembershipPageProps = { checkoutStatus?: string; testMode: boolean };

const copy = PLAN_COPY;
const formatPrice = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
const formatDate = (value: string) => new Date(value).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

export function MembershipPage({ checkoutStatus, testMode }: MembershipPageProps) {
  const { access, busy, error, runAction } = useBilling(checkoutStatus === 'returned');
  const premium = access?.plan === 'premium';
  const disabled = !!busy || !access;

  return (
    <div className="flex animate-rise flex-col gap-4">
      <PageHeader title={copy.title} description={copy.description} className="mb-2">
        {testMode && <span className="w-fit rounded-full bg-muted px-3 py-1 text-base font-semibold">{copy.testMode}</span>}
      </PageHeader>

      {checkoutStatus === 'returned' && <p role="status" className="rounded-xl bg-primary/10 p-4 text-base">{copy.returned}</p>}
      {checkoutStatus === 'cancelled' && <p role="status" className="rounded-xl bg-muted p-4 text-base">{copy.cancelled}</p>}
      {error && <p role="alert" className="rounded-xl border border-destructive/40 p-4 text-base text-destructive">{error}</p>}

      <section aria-labelledby="current-plan" className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
        <h2 id="current-plan" className="text-base font-medium text-muted-foreground">{copy.current}</h2>
        <p className="font-heading text-4xl font-semibold">{access ? (premium ? copy.premium : copy.free) : copy.loading}</p>
        {access?.subscriptionStatus && <p className="text-base text-muted-foreground">{copy.status(access.subscriptionStatus.replaceAll('_', ' '))}</p>}
        {access?.currentPeriodEnd && (
          <p className="text-base text-muted-foreground">
            {access.cancelAtPeriodEnd ? copy.ends(formatDate(access.currentPeriodEnd)) : copy.renews(formatDate(access.currentPeriodEnd))}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {access?.canManageBilling && (
            <Button variant="outline" disabled={disabled} onClick={() => void runAction('portal')}>
              <CreditCard className="size-5" aria-hidden="true" />{copy.manage}
            </Button>
          )}
          <Button variant="ghost" disabled={!!busy} onClick={() => void runAction('refresh')}>
            <RefreshCw className="size-5" aria-hidden="true" />{copy.refresh}
          </Button>
        </div>
      </section>

      {!premium && (
        <section aria-labelledby="premium-title" className="flex flex-col gap-4 rounded-2xl border-2 border-primary bg-card p-5">
          <div>
            <h2 id="premium-title" className="text-2xl font-semibold">{copy.premiumTitle}</h2>
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
          <Button size="lg" disabled={disabled} onClick={() => void runAction('premium')}>
            {busy === 'premium' && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}{copy.get}
          </Button>
          <p className="text-base text-muted-foreground">{copy.renewNote}</p>
        </section>
      )}
    </div>
  );
}
