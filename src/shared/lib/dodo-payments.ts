import DodoPayments from 'dodopayments';

import type { PurchaseKind } from '@/features/membership/types/payment.types';
import { DodoConfigSchema } from '@/features/membership/validations/membership-payments.validation';
import { BILLING_PRODUCTS } from '@/shared/const/membership-payments.const';

class DodoPaymentsClient {
  get config() {
    return DodoConfigSchema.parse({
      apiKey: process.env.DODO_PAYMENTS_API_KEY,
      webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
      environment: process.env.DODO_PAYMENTS_ENVIRONMENT ?? 'test',
      appUrl: process.env.NEXTAUTH_URL,
    });
  }

  get client() {
    const config = this.config;
    return new DodoPayments({
      bearerToken: config.apiKey,
      webhookKey: config.webhookKey,
      environment: config.environment,
      timeout: 20000,
      maxRetries: 1,
    });
  }

  get returnUrl() {
    return new URL('/dashboard/membership', this.config.appUrl).toString();
  }

  catalogKey(kind: PurchaseKind) {
    return `fitness-v1-${kind}-${BILLING_PRODUCTS[kind].price}-USD`;
  }

  async findOrCreateProduct(kind: PurchaseKind) {
    const key = this.catalogKey(kind);
    const client = this.client;
    for await (const product of client.products.list()) {
      if (product.metadata.catalog_key === key) return product.product_id;
    }
    const definition = BILLING_PRODUCTS[kind];
    const basePrice = { currency: definition.currency, price: definition.price, tax_inclusive: false };
    const product = await client.products.create({
      name: definition.name,
      description: definition.description,
      tax_category: kind === 'premium' ? 'saas' : 'live_tutoring',
      metadata: { catalog_key: key },
      price: kind === 'premium' ? {
        ...basePrice,
        type: 'recurring_price',
        payment_frequency_count: 1,
        payment_frequency_interval: 'Month',
        subscription_period_count: 20,
        subscription_period_interval: 'Year',
        trial_period_days: 0,
      } : { ...basePrice, type: 'one_time_price', pay_what_you_want: false },
    });
    return product.product_id;
  }

  async cancelAtBillingDate(subscriptionId: string) {
    return this.client.subscriptions.update(subscriptionId, { cancel_at_next_billing_date: true });
  }

  verifyWebhook(body: string, headers: Record<string, string>) {
    return this.client.webhooks.unwrap(body, { headers });
  }
}

export const dodoPayments = new DodoPaymentsClient();
export { DodoPaymentsClient };
