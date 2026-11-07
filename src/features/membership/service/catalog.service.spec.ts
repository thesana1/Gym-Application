import { beforeEach, describe, expect, it, vi } from 'vitest';

import { catalogRepository } from '@/features/membership/repository/catalog.repository';
import { getProductService } from '@/features/membership/service/catalog.service';
import { dodoPayments } from '@/shared/lib/dodo-payments';

vi.mock('@/features/membership/repository/catalog.repository', () => ({
  catalogRepository: { initialize: vi.fn(), find: vi.fn(), claim: vi.fn(), complete: vi.fn() },
}));
vi.mock('@/shared/lib/dodo-payments', () => ({ dodoPayments: {
  config: { environment: 'test_mode' }, catalogKey: () => 'premium-2000', findOrCreateProduct: vi.fn(),
} }));

describe('getProductService', () => {
  beforeEach(() => vi.resetAllMocks());
  it('uses the persisted product ID on subsequent requests', async () => {
    vi.mocked(catalogRepository.find).mockResolvedValue({ productId: 'pdt_existing' } as never);
    expect(await getProductService('premium')).toEqual({ data: { productId: 'pdt_existing' }, status: 200 });
    expect(dodoPayments.findOrCreateProduct).not.toHaveBeenCalled();
  });
  it('does not provision concurrently when another process owns the lease', async () => {
    vi.mocked(catalogRepository.find).mockResolvedValue(null);
    vi.mocked(catalogRepository.claim).mockResolvedValue(null);
    expect((await getProductService('premium')).status).toBe(503);
    expect(dodoPayments.findOrCreateProduct).not.toHaveBeenCalled();
  });
  it('persists a newly provisioned product and releases the lease on errors', async () => {
    vi.mocked(catalogRepository.claim).mockResolvedValue({} as never);
    vi.mocked(dodoPayments.findOrCreateProduct).mockResolvedValueOnce('pdt_created').mockRejectedValueOnce(new Error('network'));
    expect((await getProductService('premium')).data).toEqual({ productId: 'pdt_created' });
    expect(catalogRepository.complete).toHaveBeenLastCalledWith('test_mode:premium-2000', expect.any(Date), 'pdt_created');
    expect((await getProductService('premium')).status).toBe(502);
    expect(catalogRepository.complete).toHaveBeenLastCalledWith('test_mode:premium-2000', expect.any(Date), '');
  });
});
