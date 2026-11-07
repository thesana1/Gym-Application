import { userRepository } from '@/features/auth/repository/user.repository';
import { purchaseRepository } from '@/features/membership/repository/purchase.repository';
import { getBillingAccessService } from '@/features/membership/service/access.service';
import { getProductService } from '@/features/membership/service/catalog.service';
import type { CheckoutResponse } from '@/features/membership/types/payment.types';
import type { CheckoutType } from '@/features/membership/validations/membership-payments.validation';
import { CHECKOUT_LIFETIME_MS } from '@/shared/const/membership-payments.const';
import { dodoPayments } from '@/shared/lib/dodo-payments';
import type { ServiceResult } from '@/shared/types/common';

export async function createCheckoutService(userId: string, input: CheckoutType): Promise<ServiceResult<CheckoutResponse>> {
  const user = await userRepository.findById(userId);
  if (!user) return { data: { error: 'USER_NOT_FOUND' }, status: 404 };
  if (input.kind === 'premium' && user.membership
    && (!user.membership.environment || user.membership.environment === dodoPayments.config.environment)
    && !['cancelled', 'failed', 'expired'].includes(user.membership.status)) {
    return { data: { error: 'MANAGE_EXISTING_SUBSCRIPTION' }, status: 409 };
  }
  const access = await getBillingAccessService(userId);
  if ('error' in access.data) return { data: access.data, status: access.status };
  if (access.data.plan === 'premium') {
    return input.kind === 'consultation'
      ? { data: { included: true }, status: 200 }
      : { data: { error: 'ALREADY_PREMIUM' }, status: 409 };
  }
  const environment = dodoPayments.config.environment;
  await purchaseRepository.expirePending(userId, environment, new Date());
  const purchases = await purchaseRepository.findForUser(userId, environment);
  const subscription = purchases.find((purchase) => purchase.kind === 'premium' && purchase.subscriptionId);
  if (input.kind === 'premium' && subscription && !['cancelled', 'expired', 'failed'].includes(subscription.subscriptionStatus ?? '')) {
    return { data: { error: 'MANAGE_EXISTING_SUBSCRIPTION' }, status: 409 };
  }
  const pending = purchases.find((purchase) => purchase.kind === input.kind && purchase.status === 'pending');
  if (pending) {
    return pending.checkoutUrl
      ? { data: { checkoutUrl: pending.checkoutUrl }, status: 200 }
      : { data: { error: 'CHECKOUT_IN_PROGRESS' }, status: 409 };
  }
  const product = await getProductService(input.kind);
  if ('error' in product.data) return { data: product.data, status: product.status };
  let purchaseId: string;
  try {
    purchaseId = await purchaseRepository.create({
      userId, environment, kind: input.kind, productId: product.data.productId,
      expiresAt: new Date(Date.now() + CHECKOUT_LIFETIME_MS),
    });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return { data: { error: 'CHECKOUT_IN_PROGRESS' }, status: 409 };
    }
    return { data: { error: 'CHECKOUT_UNAVAILABLE' }, status: 500 };
  }
  try {
    const session = await dodoPayments.client.checkoutSessions.create({
      product_cart: [{ product_id: product.data.productId, quantity: 1 }],
      customer: { email: user.email, name: user.name },
      feature_flags: { allow_customer_editing_email: false, allow_currency_selection: false, allow_discount_code: false },
      metadata: { purchase_id: purchaseId, user_id: userId, kind: input.kind },
      return_url: `${dodoPayments.returnUrl}?checkout=returned`,
      cancel_url: `${dodoPayments.returnUrl}?checkout=cancelled`,
    });
    if (!session.checkout_url) return { data: { error: 'CHECKOUT_UNAVAILABLE' }, status: 502 };
    await purchaseRepository.update(purchaseId, { checkoutSessionId: session.session_id, checkoutUrl: session.checkout_url });
    return { data: { checkoutUrl: session.checkout_url }, status: 200 };
  } catch {
    // Keep the pending intent: a timed-out request may still have created a payable session.
    return { data: { error: 'PAYMENT_PROVIDER_UNAVAILABLE' }, status: 502 };
  }
}

export async function createPortalService(userId: string): Promise<ServiceResult<{ url: string }>> {
  const purchases = await purchaseRepository.findForUser(userId, dodoPayments.config.environment);
  const customerId = purchases.find((purchase) => !!purchase.customerId)?.customerId;
  if (!customerId) return { data: { error: 'BILLING_CUSTOMER_NOT_FOUND' }, status: 404 };
  try {
    const session = await dodoPayments.client.customers.customerPortal.create(customerId, { return_url: dodoPayments.returnUrl, send_email: false });
    return { data: { url: session.link }, status: 200 };
  } catch {
    return { data: { error: 'PAYMENT_PROVIDER_UNAVAILABLE' }, status: 502 };
  }
}
