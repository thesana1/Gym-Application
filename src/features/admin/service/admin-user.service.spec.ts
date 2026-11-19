import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { adminUserRepository } from '@/features/admin/repository/admin-user.repository';
import { deleteAdminUserService, updateAdminMembershipService } from '@/features/admin/service/admin-user.service';
import { userRepository } from '@/features/auth/repository/user.repository';
import type { UserDocument } from '@/features/auth/schema/user.schema';
import { cancelMembershipService } from '@/features/membership/service/membership.service';

vi.mock('@/features/admin/repository/admin-user.repository', () => ({
  adminUserRepository: { search: vi.fn(), createGiftPurchase: vi.fn(), expireGiftPurchases: vi.fn(), setMembership: vi.fn(), deleteWithData: vi.fn() },
}));
vi.mock('@/features/auth/repository/user.repository', () => ({ userRepository: { findById: vi.fn() } }));
vi.mock('@/features/membership/service/membership.service', () => ({ cancelMembershipService: vi.fn() }));

const id = new Types.ObjectId();
const future = new Date(Date.now() + 86400000 * 10);
const user = (membership: UserDocument['membership']): UserDocument => ({
  _id: id, name: 'Ana', email: 'ana@club.com', passwordHash: '', role: 'user', membership, createdAt: new Date(), updatedAt: new Date(),
});
const membership = (subscriptionId: string, status: 'active' | 'cancelled') => ({
  tier: 'premium' as const, status, subscriptionId, cancelAtPeriodEnd: false, nextBillingDate: future, lastEventAt: new Date(),
});

describe('admin user actions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('gives Premium as a non-renewing gift and a paid purchase', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(user(null));
    const result = await updateAdminMembershipService(id.toString(), { action: 'gift', months: 3 });
    expect(result.status).toBe(200);
    expect(adminUserRepository.createGiftPurchase).toHaveBeenCalledWith(id.toString(), 'test_mode', expect.any(Date));
    expect(adminUserRepository.setMembership).toHaveBeenCalledWith(id.toString(),
      expect.objectContaining({ status: 'cancelled', subscriptionId: 'admin-gift' }));
  });

  it('does not gift members who already pay, and only removes gifts', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(user(membership('sub_1', 'active')));
    expect((await updateAdminMembershipService(id.toString(), { action: 'gift', months: 1 })).data).toEqual({ error: 'ALREADY_PAYING' });
    expect((await updateAdminMembershipService(id.toString(), { action: 'remove-gift' })).data).toEqual({ error: 'NOT_GIFTED' });

    vi.mocked(userRepository.findById).mockResolvedValue(user(membership('admin-gift', 'cancelled')));
    expect((await updateAdminMembershipService(id.toString(), { action: 'remove-gift' })).status).toBe(200);
    expect(adminUserRepository.setMembership).toHaveBeenCalledWith(id.toString(), null);
  });

  it('never deletes the admin themselves and keeps paying accounts when cancelling fails', async () => {
    expect((await deleteAdminUserService(id.toString(), id.toString())).data).toEqual({ error: 'CANNOT_DELETE_SELF' });

    vi.mocked(userRepository.findById).mockResolvedValue(user(membership('sub_1', 'active')));
    vi.mocked(cancelMembershipService).mockResolvedValue({ data: { error: 'PAYMENTS_NOT_CONFIGURED' }, status: 503 });
    expect((await deleteAdminUserService('admin', id.toString())).data).toEqual({ error: 'CANCEL_FAILED' });
    expect(adminUserRepository.deleteWithData).not.toHaveBeenCalled();

    vi.mocked(userRepository.findById).mockResolvedValue(user(null));
    expect((await deleteAdminUserService('admin', id.toString())).status).toBe(200);
    expect(adminUserRepository.deleteWithData).toHaveBeenCalledWith(id.toString());
  });
});
