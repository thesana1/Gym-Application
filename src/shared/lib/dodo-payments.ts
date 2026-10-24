import DodoPayments from 'dodopayments';

type VerifiedWebhookEvent = ReturnType<DodoPayments['webhooks']['unwrap']>;

class DodoPaymentsClient {
  private createClient() {
    const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
    if (!bearerToken) {
      throw new Error('DODO_PAYMENTS_API_KEY is not configured');
    }

    const environment =
      process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'live_mode' : 'test_mode';

    return new DodoPayments({ bearerToken, environment });
  }

  async createCheckout(
    productId: string,
    user: { id: string; email: string; name: string },
    returnUrl: string
  ) {
    return this.createClient().checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email: user.email, name: user.name },
      metadata: { userId: user.id },
      feature_flags: { allow_customer_editing_email: false },
      return_url: returnUrl,
      cancel_url: returnUrl,
    });
  }

  async cancelAtBillingDate(subscriptionId: string) {
    return this.createClient().subscriptions.update(subscriptionId, {
      status: 'cancelled',
      cancel_at_next_billing_date: true,
      cancel_reason: 'cancelled_by_customer',
    });
  }

  verifyWebhook(body: string, headers: Record<string, string>): VerifiedWebhookEvent {
    const key = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
    if (!key) {
      throw new Error('DODO_PAYMENTS_WEBHOOK_KEY is not configured');
    }

    return new DodoPayments({ environment: 'test_mode' }).webhooks.unwrap(body, {
      headers,
      key,
    });
  }
}

export const dodoPayments = new DodoPaymentsClient();
