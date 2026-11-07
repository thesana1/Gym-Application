import mongoose from 'mongoose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth/repository/user.repository', () => ({
  userRepository: {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    markMembershipCancellationById: vi.fn(),
    updateMembershipById: vi.fn(),
  },
}));

vi.mock('@/shared/lib/dodo-payments', () => ({
  dodoPayments: {
    createCheckout: vi.fn(),
    cancelAtBillingDate: vi.fn(),
  },
}));

import { userRepository } from '@/features/auth/repository/user.repository';
import type { UserDocument } from '@/features/auth/schema/user.schema';
import type { Membership } from '@/features/membership/types/membership.types';
import { dodoPayments } from '@/shared/lib/dodo-payments';

import {
  cancelMembershipService,
  getMembershipService,
  syncMembershipFromWebhook,
} from './membership.service';

const mockRepository = vi.mocked(userRepository);
const mockPayments = vi.mocked(dodoPayments);
const USER_ID = new mongoose.Types.ObjectId().toString();

const makeUser = (membership: UserDocument['membership'] = null): UserDocument => ({
  _id: new mongoose.Types.ObjectId(USER_ID),
  name: 'Member',
  email: 'member@example.com',
  passwordHash: 'hash',
  role: 'user',
  membership,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
});

describe('membership service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  afterEach(() => vi.unstubAllEnvs());

  it('schedules cancellation and keeps the membership until period end', async () => {
    vi.stubEnv('DODO_PAYMENTS_API_KEY', 'test-api-key');
    mockRepository.findById.mockResolvedValueOnce(
      makeUser({
        tier: 'vipplus',
        status: 'active',
        subscriptionId: 'sub_active',
        cancelAtPeriodEnd: false,
        lastEventAt: new Date(),
      })
    );
    mockRepository.markMembershipCancellationById.mockResolvedValueOnce(true);

    const result = await cancelMembershipService(USER_ID);

    expect(mockPayments.cancelAtBillingDate).toHaveBeenCalledWith('sub_active');
    expect(mockRepository.markMembershipCancellationById).toHaveBeenCalledWith(USER_ID);
    expect(result.status).toBe(200);
    expect(result.data).toEqual({
      message: 'Membership will remain active until the end of the billing period',
    });
  });

  it('links a verified webhook by checkout email when subscription metadata is absent', async () => {
    const user = makeUser();
    mockRepository.findByEmail.mockResolvedValueOnce(user);
    mockRepository.updateMembershipById.mockResolvedValueOnce(true);
    const membership: Membership = {
      tier: 'vip',
      status: 'active',
      subscriptionId: 'sub_active',
      cancelAtPeriodEnd: false,
      lastEventAt: new Date(),
    };

    const result = await syncMembershipFromWebhook(
      membership,
      undefined,
      'member@example.com'
    );

    expect(result).toBe(true);
    expect(mockRepository.updateMembershipById).toHaveBeenCalledWith(
      USER_ID,
      membership
    );
  });

  it('returns the current membership summary', async () => {
    mockRepository.findById.mockResolvedValueOnce(
      makeUser({
        tier: 'vip',
        status: 'active',
        subscriptionId: 'sub_active',
        nextBillingDate: new Date('2026-02-01T00:00:00.000Z'),
        cancelAtPeriodEnd: false,
        lastEventAt: new Date('2026-01-01T00:00:00.000Z'),
      })
    );

    const result = await getMembershipService(USER_ID);

    expect(result).toEqual({
      data: {
        tier: 'vip',
        entitled: false,
        status: 'active',
        subscriptionId: 'sub_active',
        nextBillingDate: '2026-02-01T00:00:00.000Z',
        cancelAtPeriodEnd: false,
      },
      status: 200,
    });
  });
});
