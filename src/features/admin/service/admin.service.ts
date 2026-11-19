import { adminRepository } from '@/features/admin/repository/admin.repository';
import type { AdminDailySignups, AdminStats } from '@/features/admin/types/admin.types';
import { ADMIN_GIFT_ID, ADMIN_LIMITS } from '@/shared/const/admin.const';
import { MEMBERSHIP_PLANS } from '@/shared/const/membership.const';
import type { ServiceResult } from '@/shared/types/common';
import { isMembershipEntitled } from '@/shared/utils/membership';

const DAY_MS = 86400000;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS);
const isoDay = (date: Date) => date.toISOString().slice(0, 10);

// Fills days without sign-ups with 0 so the chart has one bar per day, oldest first.
const fillDays = (counts: { _id: string; count: number }[], days: number): AdminDailySignups[] => {
  const byDay = new Map(counts.map(({ _id, count }) => [_id, count]));
  return Array.from({ length: days }, (_, index) => {
    const day = isoDay(daysAgo(days - 1 - index));
    return { day, count: byDay.get(day) ?? 0 };
  });
};

export async function getAdminStatsService(): Promise<ServiceResult<AdminStats>> {
  const weekAgo = daysAgo(7);
  const chartStart = new Date(`${isoDay(daysAgo(ADMIN_LIMITS.chartDays - 1))}T00:00:00.000Z`);
  const [total, last7Days, last30Days, finishedProfile, everBought, premiumUsers, signups, workouts7Days, workoutUsers, meals7Days, mealUsers] =
    await Promise.all([
      adminRepository.countUsersSince(new Date(0)),
      adminRepository.countUsersSince(weekAgo),
      adminRepository.countUsersSince(daysAgo(30)),
      adminRepository.countProfiles(),
      adminRepository.countUsersWhoBought(),
      adminRepository.findUsersWithPaidStatus(),
      adminRepository.countSignupsByDay(chartStart),
      adminRepository.countWorkoutsSince(weekAgo),
      adminRepository.findWorkoutUserIdsSince(weekAgo),
      adminRepository.countMealsSince(isoDay(weekAgo)),
      adminRepository.findMealUserIdsSince(isoDay(weekAgo)),
    ]);

  const entitled = premiumUsers.filter((user) => isMembershipEntitled(user.membership));
  const paying = entitled.filter((user) => user.membership?.subscriptionId !== ADMIN_GIFT_ID);
  const cancelling = paying.filter((user) => user.membership?.cancelAtPeriodEnd || user.membership?.status === 'cancelled').length;

  return {
    status: 200,
    data: {
      users: { total, last7Days, last30Days, finishedProfile },
      premium: {
        active: paying.length,
        gifted: entitled.length - paying.length,
        cancelling,
        everBought,
        conversionPercent: total ? Math.round((paying.length / total) * 1000) / 10 : 0,
        monthlyRevenue: (paying.length - cancelling) * MEMBERSHIP_PLANS[0].price,
      },
      activity: { activeUsers7Days: new Set([...workoutUsers, ...mealUsers]).size, workouts7Days, meals7Days },
      signups: fillDays(signups, ADMIN_LIMITS.chartDays),
    },
  };
}
