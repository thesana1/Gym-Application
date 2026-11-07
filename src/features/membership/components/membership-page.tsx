'use client';

import { Check, CreditCard, Loader2 } from 'lucide-react';

import { useBilling } from '@/features/membership/hooks/use-billing';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { BILLING_PRODUCTS, PREMIUM_BENEFITS } from '@/shared/const/membership-payments.const';

type MembershipPageProps = { checkoutStatus?: string; testMode: boolean };

export function MembershipPage({ checkoutStatus, testMode }: MembershipPageProps) {
  const { access, busy, error, runAction } = useBilling(checkoutStatus === 'returned');
  const premium = access?.plan === 'premium';
  const disabled = !!busy || !access;
  const formatPrice = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Membership</p>
          <h1 className="mt-1 text-3xl font-bold">Plans & billing</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your fitness, without limits. Cancel your subscription anytime.</p>
        </div>
        {testMode && <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">Test payments</span>}
      </header>

      {checkoutStatus === 'returned' && (
        <p role="status" className="rounded-lg border border-border bg-muted p-4 text-sm">
          Your checkout has returned. Payment confirmation can take a moment; your verified access is shown below.
        </p>
      )}
      {checkoutStatus === 'cancelled' && <p role="status" className="text-sm text-muted-foreground">You left checkout. Your access is shown below.</p>}
      {error && <p role="alert" className="rounded-lg border border-destructive p-4 text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader><CardTitle>Your membership</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-lg font-semibold">{access ? premium ? 'Premium — unlimited access' : 'Free plan' : 'Loading membership…'}</p>
          {access?.subscriptionStatus && <p className="text-sm text-muted-foreground">Subscription status: {access.subscriptionStatus.replaceAll('_', ' ')}</p>}
          {access?.currentPeriodEnd && (
            <p className="text-sm text-muted-foreground">
              {access.cancelAtPeriodEnd ? 'Scheduled to end' : 'Current period ends'}: {new Date(access.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
          {access && <p className="text-sm">{premium ? 'Coach consultations are included.' : `Consultation credits: ${access.consultationCredits}`}</p>}
          <div className="flex flex-wrap gap-3">
            {access?.canManageBilling && (
              <Button variant="outline" disabled={disabled} onClick={() => void runAction('portal')}>
                <CreditCard className="size-4" /> Manage billing
              </Button>
            )}
            <Button variant="ghost" disabled={!!busy} onClick={() => void runAction('refresh')}>Refresh status</Button>
          </div>
        </CardContent>
      </Card>

      <section aria-label="Payment options" className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Premium</CardTitle>
            <p className="text-3xl font-bold">
              {formatPrice(BILLING_PRODUCTS.premium.price)}<span className="text-sm font-normal text-muted-foreground"> / month</span>
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <ul className="flex flex-col gap-3">
              {PREMIUM_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex gap-2 text-sm"><Check className="size-4 shrink-0 text-primary" />{benefit}</li>
              ))}
            </ul>
            <Button disabled={disabled || premium} onClick={() => void runAction('premium')}>
              {busy === 'premium' && <Loader2 className="size-4 animate-spin" />}
              {premium ? 'Premium is active' : 'Get Premium'}
            </Button>
            <p className="text-xs text-muted-foreground">Renews monthly. Applicable taxes are calculated at checkout.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Coach consultation</CardTitle>
            <p className="text-3xl font-bold">{premium ? 'Included' : formatPrice(BILLING_PRODUCTS.consultation.price)}</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <p className="text-sm text-muted-foreground">Purchase one individual consultation, or join Premium for consultations and unlimited features.</p>
            <Button variant="outline" disabled={disabled || premium} onClick={() => void runAction('consultation')}>
              {busy === 'consultation' && <Loader2 className="size-4 animate-spin" />}
              {premium ? 'Included in your membership' : 'Buy a consultation'}
            </Button>
            <p className="text-xs text-muted-foreground">One-time payment. A consultation credit is added after payment is confirmed.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
