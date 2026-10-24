import { NextRequest, NextResponse } from 'next/server';

import {
  getMembershipTierForProduct,
  syncMembershipFromWebhook,
} from '@/features/membership/service/membership.service';
import type { Membership, MembershipStatus } from '@/features/membership/types/membership.types';
import { dodoPayments } from '@/shared/lib/dodo-payments';

export async function POST(request: NextRequest) {
  if (!process.env.DODO_PAYMENTS_WEBHOOK_KEY) {
    return NextResponse.json({ error: 'WEBHOOK_NOT_CONFIGURED' }, { status: 503 });
  }

  const body = await request.text();
  const headers = {
    'webhook-id': request.headers.get('webhook-id') ?? '',
    'webhook-signature': request.headers.get('webhook-signature') ?? '',
    'webhook-timestamp': request.headers.get('webhook-timestamp') ?? '',
  };
  if (Object.values(headers).some((value) => !value)) {
    return NextResponse.json({ error: 'MISSING_WEBHOOK_HEADERS' }, { status: 400 });
  }

  let event;
  try {
    event = dodoPayments.verifyWebhook(body, headers);
  } catch {
    return NextResponse.json({ error: 'INVALID_WEBHOOK_SIGNATURE' }, { status: 401 });
  }

  try {
    switch (event.type) {
      case 'subscription.active':
      case 'subscription.updated':
      case 'subscription.past_due':
      case 'subscription.on_hold':
      case 'subscription.paused':
      case 'subscription.unpaused':
      case 'subscription.renewed':
      case 'subscription.plan_changed':
      case 'subscription.cancelled':
      case 'subscription.expired':
      case 'subscription.failed': {
        const userId = event.data.metadata?.userId;
        const tier = getMembershipTierForProduct(event.data.product_id);
        if (!tier) {
          console.error('Ignoring Dodo subscription event with an unknown product');
          return NextResponse.json({ received: true });
        }

        const membership: Membership = {
          tier,
          status: event.data.status as MembershipStatus,
          subscriptionId: event.data.subscription_id,
          customerId: event.data.customer.customer_id,
          nextBillingDate: event.data.next_billing_date
            ? new Date(event.data.next_billing_date)
            : undefined,
          cancelAtPeriodEnd: event.data.cancel_at_next_billing_date,
          lastEventAt: new Date(event.timestamp),
        };
        const updated = await syncMembershipFromWebhook(
          membership,
          typeof userId === 'string' ? userId : undefined,
          event.data.customer.email
        );
        if (!updated) {
          console.warn('Ignoring a stale Dodo subscription event or unknown user');
        }
        break;
      }
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'WEBHOOK_PROCESSING_FAILED' }, { status: 500 });
  }
}
