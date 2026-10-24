'use client';

import { BadgeCheck, LoaderCircle, Star } from 'lucide-react';
import { useState } from 'react';

import type { MembershipSummary, MembershipTier } from '@/features/membership/types/membership.types';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { MEMBERSHIP_PLANS } from '@/shared/const/membership.const';

type MembershipPageProps = {
  membership: MembershipSummary | null;
};

const getErrorMessage = (code?: string) => {
  if (code === 'ACTIVE_MEMBERSHIP_EXISTS') {
    return 'You already have an active membership. Cancel it before starting another plan.';
  }
  if (code === 'PLAN_NOT_CONFIGURED') {
    return 'This plan is not available yet. Please contact the gym team.';
  }
  if (code === 'PAYMENTS_NOT_CONFIGURED') {
    return 'Payments are not configured yet. Please contact the gym team.';
  }
  return 'Something went wrong. Please try again.';
};

const formatBillingDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(date));

export const MembershipPage = ({ membership: initialMembership }: MembershipPageProps) => {
  const [membership, setMembership] = useState(initialMembership);
  const [loadingTier, setLoadingTier] = useState<MembershipTier | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const hasActiveMembership =
    membership !== null && ['active', 'past_due'].includes(membership.status);
  const hasOngoingSubscription =
    membership !== null &&
    !['cancelled', 'failed', 'expired'].includes(membership.status);

  const startCheckout = async (tier: MembershipTier) => {
    setLoadingTier(tier);
    setMessage(null);

    try {
      const response = await fetch('/api/membership/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const result: { checkoutUrl?: string; error?: string } = await response.json();

      if (!response.ok || !result.checkoutUrl) {
        setMessage(getErrorMessage(result.error));
        return;
      }

      window.location.assign(result.checkoutUrl);
    } catch {
      setMessage('Could not connect to checkout. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  const cancelMembership = async () => {
    setCancelling(true);
    setMessage(null);

    try {
      const response = await fetch('/api/membership/cancel', { method: 'POST' });
      const result: {
        message?: string;
        error?: string;
      } = await response.json();

      if (!response.ok) {
        setMessage(getErrorMessage(result.error));
        return;
      }

      setMembership((current) =>
        current ? { ...current, cancelAtPeriodEnd: true } : current
      );
      setMessage(result.message ?? 'Your cancellation has been scheduled.');
    } catch {
      setMessage('Could not cancel your membership. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Membership
        </p>
        <h1 className="text-3xl font-bold">Train with more support</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Choose a monthly plan. Your membership badge appears after Dodo Payments confirms
          your subscription.
        </p>
      </header>

      {membership ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BadgeCheck className="size-5 text-primary" />
              Your membership
            </CardTitle>
            <CardDescription>
              {MEMBERSHIP_PLANS.find(({ tier }) => tier === membership.tier)?.name} ·{' '}
              {membership.status.replaceAll('_', ' ')}
              {membership.cancelAtPeriodEnd ? ' · Cancels at the end of this billing period' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {membership.nextBillingDate
                ? `Next billing date: ${formatBillingDate(membership.nextBillingDate)}`
                : 'Your subscription status is synced with Dodo Payments.'}
            </p>
            {hasOngoingSubscription && !membership.cancelAtPeriodEnd ? (
              <Button
                variant="outline"
                disabled={cancelling}
                onClick={() => {
                  if (window.confirm('Cancel at the end of your current billing period?')) {
                    void cancelMembership();
                  }
                }}
              >
                {cancelling ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Cancel membership
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <section aria-label="Membership plans" className="grid gap-4 md:grid-cols-3">
        {MEMBERSHIP_PLANS.map(({ tier, name, price }, index) => {
          const isCurrentPlan = membership?.tier === tier && hasActiveMembership;
          return (
            <Card key={tier} className={index === 1 ? 'border-primary/50 shadow-sm' : undefined}>
              <CardHeader>
                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Star aria-hidden="true" className="size-5" />
                </span>
                <CardTitle className="mt-2">{name}</CardTitle>
                <CardDescription>
                  {isCurrentPlan ? 'Your current plan' : 'Monthly membership'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-3xl font-bold">
                  ${price}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">/ month</span>
                </p>
                {isCurrentPlan ? (
                  <Button variant="secondary" disabled>
                    Current plan
                  </Button>
                ) : (
                  <Button
                    disabled={hasOngoingSubscription || loadingTier !== null}
                    onClick={() => void startCheckout(tier)}
                  >
                    {loadingTier === tier ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : null}
                    Choose {name}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <p aria-live="polite" className="min-h-5 text-sm text-muted-foreground">
        {message}
      </p>
    </div>
  );
};
