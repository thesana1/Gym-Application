import { catalogRepository } from '@/features/membership/repository/catalog.repository';
import type { PurchaseKind } from '@/features/membership/types/payment.types';
import { PaymentProviderErrorSchema } from '@/features/membership/validations/membership-payments.validation';
import { CATALOG_LEASE_MS } from '@/shared/const/membership-payments.const';
import { dodoPayments } from '@/shared/lib/dodo-payments';
import type { ServiceResult } from '@/shared/types/common';

export async function getProductService(kind: PurchaseKind): Promise<ServiceResult<{ productId: string }>> {
  const key = `${dodoPayments.config.environment}:${dodoPayments.catalogKey(kind)}`;
  await catalogRepository.initialize(key);
  const existing = await catalogRepository.find(key);
  if (existing?.productId) return { data: { productId: existing.productId }, status: 200 };
  const leaseUntil = new Date(Date.now() + CATALOG_LEASE_MS);
  const lease = await catalogRepository.claim(key, new Date(), leaseUntil);
  if (!lease) return { data: { error: 'PRODUCT_SETUP_IN_PROGRESS' }, status: 503 };
  try {
    const productId = await dodoPayments.findOrCreateProduct(kind);
    await catalogRepository.complete(key, leaseUntil, productId);
    return { data: { productId }, status: 200 };
  } catch (error) {
    await catalogRepository.complete(key, leaseUntil, '');
    const providerError = PaymentProviderErrorSchema.safeParse(error);
    if (providerError.success && providerError.data.error.code === 'UNSUPPORTED_TAX_CATEGORY') {
      return { data: { error: 'PRODUCT_CATEGORY_NOT_ENABLED' }, status: 503 };
    }
    return { data: { error: 'PAYMENT_PROVIDER_UNAVAILABLE' }, status: 502 };
  }
}
