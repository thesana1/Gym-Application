import { userRepository } from '@/features/auth/repository/user.repository';
import { coachRepository } from '@/features/coaches/repository/coach.repository';
import { purchaseRepository } from '@/features/membership/repository/purchase.repository';
import { BillingUserIdSchema } from '@/features/membership/validations/membership-payments.validation';
import { dodoPayments } from '@/shared/lib/dodo-payments';
import type { ServiceResult } from '@/shared/types/common';

async function syncSubscription(subscriptionId: string, timestamp: Date) {
  const subscription = await dodoPayments.client.subscriptions.retrieve(subscriptionId);
  const purchaseId = subscription.metadata.purchase_id;
  if (typeof purchaseId !== 'string' || !BillingUserIdSchema.safeParse(purchaseId).success) return;
  const purchase = await purchaseRepository.findById(purchaseId, dodoPayments.config.environment);
  if (!purchase || purchase.kind !== 'premium' || purchase.productId !== subscription.product_id
    || purchase.userId !== subscription.metadata.user_id) return;
  const periodEnd = new Date(subscription.next_billing_date);
  if (subscription.expires_at && new Date(subscription.expires_at) < periodEnd) {
    periodEnd.setTime(new Date(subscription.expires_at).getTime());
  }
  if (!Number.isFinite(periodEnd.getTime())) throw new Error('INVALID_SUBSCRIPTION_PERIOD');
  const updated = await purchaseRepository.applyEvent(purchaseId, timestamp, {
    status: 'paid',
    subscriptionId: subscription.subscription_id,
    subscriptionStatus: subscription.status,
    customerId: subscription.customer.customer_id,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_next_billing_date,
  });
  if (updated?.matchedCount === 0) return;
  await userRepository.updateMembershipById(purchase.userId, {
    tier: 'premium', status: subscription.status, subscriptionId: subscription.subscription_id,
    customerId: subscription.customer.customer_id, nextBillingDate: periodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_next_billing_date, lastEventAt: timestamp,
    environment: dodoPayments.config.environment,
    refundedPeriodEnd: purchase.refundedPeriodEnd ?? undefined,
  });
}

async function syncPayment(paymentId: string, timestamp: Date) {
  const payment = await dodoPayments.client.payments.retrieve(paymentId);
  const purchaseId = payment.metadata.purchase_id;
  if (typeof purchaseId !== 'string' || !BillingUserIdSchema.safeParse(purchaseId).success) return;
  const purchase = await purchaseRepository.findById(purchaseId, dodoPayments.config.environment);
  if (!purchase || purchase.userId !== payment.metadata.user_id) return;
  if (purchase.kind === 'premium') {
    const subscriptionId = payment.subscription_id ?? payment.subscription_ids[0];
    if (!subscriptionId) return;
    await syncSubscription(subscriptionId, timestamp);
    const refunded = payment.refunds.some((refund) => refund.status === 'succeeded' && !refund.is_partial);
    const servicePeriod = payment.service_periods.find((period) => period.subscription_id === subscriptionId);
    if (refunded && servicePeriod) {
      await purchaseRepository.recordRefund(purchaseId, new Date(servicePeriod.ends_at));
      await userRepository.recordMembershipRefund(purchase.userId, subscriptionId, new Date(servicePeriod.ends_at));
    }
    return;
  }
  const product = payment.product_cart?.find((item) => item.product_id === purchase.productId);
  if (!product || product.quantity !== 1 || (purchase.checkoutSessionId && payment.checkout_session_id !== purchase.checkoutSessionId)) return;
  const refunded = payment.refunds.some((refund) => refund.status === 'succeeded' && !refund.is_partial);
  const status = refunded ? 'refunded' : payment.status === 'succeeded' ? 'paid'
    : payment.status === 'failed' || payment.status === 'cancelled' ? 'failed' : 'pending';
  await purchaseRepository.applyEvent(purchaseId, timestamp, {
    status, paymentId: payment.payment_id, customerId: payment.customer.customer_id,
  });
  if (refunded) await coachRepository.cancelRequestsForPurchase(purchaseId);
}

export async function handleWebhookService(body: string, headers: Record<string, string>): Promise<ServiceResult<{ received: true }>> {
  // Validate configuration separately so a missing server secret is not reported as a bad signature.
  void dodoPayments.config;
  let event: ReturnType<typeof dodoPayments.verifyWebhook>;
  try {
    event = dodoPayments.verifyWebhook(body, headers);
  } catch {
    return { data: { error: 'INVALID_WEBHOOK_SIGNATURE' }, status: 401 };
  }
  const timestamp = new Date(event.timestamp);
  if (!Number.isFinite(timestamp.getTime())) return { data: { error: 'INVALID_WEBHOOK_TIMESTAMP' }, status: 400 };
  if (event.type.startsWith('subscription.') && 'subscription_id' in event.data && typeof event.data.subscription_id === 'string') {
    await syncSubscription(event.data.subscription_id, timestamp);
  } else if (event.type.startsWith('payment.') && 'payment_id' in event.data && typeof event.data.payment_id === 'string') {
    await syncPayment(event.data.payment_id, timestamp);
  } else if (event.type === 'refund.succeeded') {
    await syncPayment(event.data.payment_id, timestamp);
  }
  return { data: { received: true }, status: 200 };
}
