import { UserDocument, UserModel } from '@/features/auth/schema/user.schema';
import { FitnessProfileModel } from '@/features/fitness/schema/fitness-profile.schema';
import { WorkoutLogModel } from '@/features/fitness/schema/workout-log.schema';
import { NutritionEntryModel } from '@/features/nutrition/schema/nutrition.schema';
import { ADMIN_GIFT_ID } from '@/shared/const/admin.const';
import { mongo } from '@/shared/lib/mongo';

type DayCount = { _id: string; count: number };

// Statuses that mean a member got as far as a real Premium subscription (not just an abandoned checkout).
const BOUGHT_STATUSES = ['active', 'cancelled', 'expired', 'on_hold', 'paused', 'past_due'];

export const adminRepository = {
  async countUsersSince(since: Date): Promise<number> {
    await mongo.connect();
    return UserModel.countDocuments({ createdAt: { $gte: since } }).exec();
  },

  async countUsersWhoBought(): Promise<number> {
    await mongo.connect();
    return UserModel.countDocuments({ 'membership.status': { $in: BOUGHT_STATUSES }, 'membership.subscriptionId': { $ne: ADMIN_GIFT_ID } }).exec();
  },

  async findUsersWithPaidStatus(): Promise<UserDocument[]> {
    await mongo.connect();
    return UserModel.find({ 'membership.status': { $in: ['active', 'cancelled'] } }, { membership: 1 }).lean<UserDocument[]>().exec();
  },

  async countSignupsByDay(since: Date): Promise<DayCount[]> {
    await mongo.connect();
    return UserModel.aggregate<DayCount>([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]).exec();
  },

  async countProfiles(): Promise<number> {
    await mongo.connect();
    return FitnessProfileModel.countDocuments().exec();
  },

  async countWorkoutsSince(since: Date): Promise<number> {
    await mongo.connect();
    return WorkoutLogModel.countDocuments({ completedAt: { $gte: since } }).exec();
  },

  async findWorkoutUserIdsSince(since: Date): Promise<string[]> {
    await mongo.connect();
    const ids = await WorkoutLogModel.distinct('userId', { completedAt: { $gte: since } }).exec();
    return ids.map(String);
  },

  async countMealsSince(day: string): Promise<number> {
    await mongo.connect();
    return NutritionEntryModel.countDocuments({ date: { $gte: day } }).exec();
  },

  async findMealUserIdsSince(day: string): Promise<string[]> {
    await mongo.connect();
    const ids = await NutritionEntryModel.distinct('userId', { date: { $gte: day } }).exec();
    return ids.map(String);
  },
};
