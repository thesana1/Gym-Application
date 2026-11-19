import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { adminRepository } from '@/features/admin/repository/admin.repository';
import { getAdminStatsService } from '@/features/admin/service/admin.service';
import type { AdminStats } from '@/features/admin/types/admin.types';
import type { UserDocument } from '@/features/auth/schema/user.schema';

vi.mock('@/features/admin/repository/admin.repository', () => ({
  adminRepository: {
    countUsersSince: vi.fn(), countUsersWhoBought: vi.fn(), findUsersWithPaidStatus: vi.fn(),
    countSignupsByDay: vi.fn(), countProfiles: vi.fn(), countWorkoutsSince: vi.fn(), findWorkoutUserIdsSince: vi.fn(),
    countMealsSince: vi.fn(), findMealUserIdsSince: vi.fn(),
  },
}));

const future = new Date(Date.now() + 86400000);
const user = (membership: UserDocument['membership'], name = 'Ana'): UserDocument => ({
  _id: new Types.ObjectId(), name, email: `${name}@club.com`, passwordHash: '', role: 'user', membership,
  createdAt: new Date(), updatedAt: new Date(),
});
const paid = (cancelAtPeriodEnd: boolean) => ({
  tier: 'premium' as const, status: 'active' as const, subscriptionId: 'sub', cancelAtPeriodEnd,
  nextBillingDate: future, lastEventAt: new Date(),
});

describe('getAdminStatsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminRepository.countUsersSince).mockResolvedValue(10);
    vi.mocked(adminRepository.countUsersWhoBought).mockResolvedValue(4);
    vi.mocked(adminRepository.countProfiles).mockResolvedValue(8);
    vi.mocked(adminRepository.countWorkoutsSince).mockResolvedValue(12);
    vi.mocked(adminRepository.countMealsSince).mockResolvedValue(30);
    vi.mocked(adminRepository.findWorkoutUserIdsSince).mockResolvedValue(['a', 'b']);
    vi.mocked(adminRepository.findMealUserIdsSince).mockResolvedValue(['b', 'c']);
    vi.mocked(adminRepository.countSignupsByDay).mockResolvedValue([{ _id: new Date().toISOString().slice(0, 10), count: 3 }]);
    vi.mocked(adminRepository.findUsersWithPaidStatus).mockResolvedValue([
      user(paid(false)), user(paid(true)), user({ ...paid(false), nextBillingDate: new Date(0) }),
      user({ ...paid(false), status: 'cancelled', subscriptionId: 'admin-gift' }),
    ]);
  });

  it('counts paying members, revenue, active users and fills the sign-up chart', async () => {
    const result = await getAdminStatsService();
    const stats = result.data as AdminStats;
    expect(result.status).toBe(200);
    expect(stats.premium).toEqual({ active: 2, gifted: 1, cancelling: 1, everBought: 4, conversionPercent: 20, monthlyRevenue: 20 });
    expect(stats.activity).toEqual({ activeUsers7Days: 3, workouts7Days: 12, meals7Days: 30 });
    expect(stats.signups).toHaveLength(14);
    expect(stats.signups.at(-1)?.count).toBe(3);
    expect(stats.signups[0].count).toBe(0);
  });
});
