import { adminUserRepository } from '@/features/admin/repository/admin-user.repository';
import type { AdminUserRow } from '@/features/admin/types/admin.types';
import type { AdminMembershipType } from '@/features/admin/validations/admin.validation';
import { userRepository } from '@/features/auth/repository/user.repository';
import type { UserDocument } from '@/features/auth/schema/user.schema';
import { cancelMembershipService } from '@/features/membership/service/membership.service';
import { ADMIN_GIFT_ID, ADMIN_LIMITS } from '@/shared/const/admin.const';
import type { ServiceResult } from '@/shared/types/common';
import { isAdminEmail } from '@/shared/utils/admin';
import { billingEnvironment, isMembershipEntitled } from '@/shared/utils/membership';

type Message = { message: string };

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A real Dodo subscription that will still bill or is still running.
const hasOngoingPaidSubscription = (membership: UserDocument['membership']) =>
  Boolean(membership && membership.subscriptionId !== ADMIN_GIFT_ID && !['cancelled', 'failed', 'expired'].includes(membership.status));

export const toAdminUserRow = (user: UserDocument): AdminUserRow => {
  const membership = user.membership;
  const entitled = isMembershipEntitled(membership);
  const plan = !entitled ? 'free' : membership?.subscriptionId === ADMIN_GIFT_ID ? 'gift' : 'paid';
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    joinedAt: (user.createdAt ?? new Date(0)).toISOString(),
    plan,
    premiumUntil: entitled ? (membership?.nextBillingDate?.toISOString() ?? null) : null,
    cancelling: plan === 'paid' && Boolean(membership?.cancelAtPeriodEnd || membership?.status === 'cancelled'),
    isAdmin: user.role === 'admin' || isAdminEmail(user.email),
  };
};

export async function searchAdminUsersService(query: string): Promise<ServiceResult<AdminUserRow[]>> {
  const users = await adminUserRepository.search(new RegExp(escapeRegex(query.trim()), 'i'), ADMIN_LIMITS.listUsers);
  return { data: users.map(toAdminUserRow), status: 200 };
}

const giftPremium = async (user: UserDocument, months: number): Promise<ServiceResult<Message>> => {
  if (hasOngoingPaidSubscription(user.membership) && isMembershipEntitled(user.membership)) {
    return { data: { error: 'ALREADY_PAYING' }, status: 409 };
  }
  const userId = user._id.toString();
  const now = new Date();
  const until = new Date(now);
  until.setMonth(until.getMonth() + months);
  const environment = billingEnvironment();
  await adminUserRepository.expireGiftPurchases(userId);
  await adminUserRepository.createGiftPurchase(userId, environment, until);
  // Stored as a non-renewing ('cancelled') membership so a later real subscription can replace it.
  await adminUserRepository.setMembership(userId, {
    tier: 'premium', status: 'cancelled', subscriptionId: ADMIN_GIFT_ID, cancelAtPeriodEnd: false,
    nextBillingDate: until, environment, lastEventAt: now,
  });
  return { data: { message: 'GIFTED' }, status: 200 };
};

const removeGift = async (user: UserDocument): Promise<ServiceResult<Message>> => {
  if (user.membership?.subscriptionId !== ADMIN_GIFT_ID) return { data: { error: 'NOT_GIFTED' }, status: 409 };
  const userId = user._id.toString();
  await adminUserRepository.expireGiftPurchases(userId);
  await adminUserRepository.setMembership(userId, null);
  return { data: { message: 'GIFT_REMOVED' }, status: 200 };
};

export async function updateAdminMembershipService(userId: string, input: AdminMembershipType): Promise<ServiceResult<Message>> {
  const user = await userRepository.findById(userId);
  if (!user) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (input.action === 'gift') return giftPremium(user, input.months);
  if (input.action === 'remove-gift') return removeGift(user);
  return cancelMembershipService(userId);
}

export async function deleteAdminUserService(adminId: string, userId: string): Promise<ServiceResult<Message>> {
  if (adminId === userId) return { data: { error: 'CANNOT_DELETE_SELF' }, status: 400 };
  const user = await userRepository.findById(userId);
  if (!user) return { data: { error: 'NOT_FOUND' }, status: 404 };
  // Stop future charges first; if that fails the account is kept so nobody is billed without an account.
  if (hasOngoingPaidSubscription(user.membership) && !user.membership?.cancelAtPeriodEnd) {
    const cancelled = await cancelMembershipService(userId);
    if (cancelled.status >= 400) return { data: { error: 'CANCEL_FAILED' }, status: cancelled.status };
  }
  await adminUserRepository.deleteWithData(userId);
  return { data: { message: 'DELETED' }, status: 200 };
}
