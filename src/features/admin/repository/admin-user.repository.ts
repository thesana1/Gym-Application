import { AiResultModel } from '@/features/ai/schema/ai-result.schema';
import { AiUsageModel } from '@/features/ai/schema/ai-usage.schema';
import { UserDocument, UserModel } from '@/features/auth/schema/user.schema';
import { ChallengeEnrollmentModel } from '@/features/challenges/schema/challenge-enrollment.schema';
import { FitnessProfileModel } from '@/features/fitness/schema/fitness-profile.schema';
import { ProgressMeasurementModel } from '@/features/fitness/schema/progress-measurement.schema';
import { WorkoutLogModel } from '@/features/fitness/schema/workout-log.schema';
import { PurchaseModel } from '@/features/membership/schema/purchase.schema';
import type { Membership } from '@/features/membership/types/membership.types';
import type { BillingEnvironment } from '@/features/membership/types/payment.types';
import { NutritionEntryModel, NutritionTargetsModel } from '@/features/nutrition/schema/nutrition.schema';
import { TrainingPlanModel } from '@/features/training/schema/training-plan.schema';
import { ADMIN_GIFT_ID } from '@/shared/const/admin.const';
import { mongo } from '@/shared/lib/mongo';

// Every collection that holds data owned by one user; Mongoose casts the id to each schema's userId type.
const OWNED_MODELS = [
  AiResultModel, AiUsageModel, ChallengeEnrollmentModel, FitnessProfileModel, ProgressMeasurementModel,
  WorkoutLogModel, PurchaseModel, NutritionEntryModel, NutritionTargetsModel, TrainingPlanModel,
];

export const adminUserRepository = {
  async search(pattern: RegExp, limit: number): Promise<UserDocument[]> {
    await mongo.connect();
    return UserModel.find({ $or: [{ name: pattern }, { email: pattern }] }, { name: 1, email: 1, role: 1, createdAt: 1, membership: 1 })
      .sort({ createdAt: -1 }).limit(limit).lean<UserDocument[]>().exec();
  },

  async createGiftPurchase(userId: string, environment: BillingEnvironment, until: Date): Promise<void> {
    await mongo.connect();
    await PurchaseModel.create({
      userId, environment, kind: 'premium', productId: ADMIN_GIFT_ID, status: 'paid', subscriptionStatus: 'cancelled',
      currentPeriodEnd: until, expiresAt: until, latestEventAt: new Date(),
    });
  },

  async expireGiftPurchases(userId: string): Promise<void> {
    await mongo.connect();
    await PurchaseModel.updateMany({ userId, productId: ADMIN_GIFT_ID, status: 'paid' }, { $set: { status: 'expired' } }).exec();
  },

  async setMembership(userId: string, membership: Membership | null): Promise<boolean> {
    await mongo.connect();
    const result = await UserModel.updateOne({ _id: userId }, { $set: { membership } }).exec();
    return result.matchedCount > 0;
  },

  async deleteWithData(userId: string): Promise<boolean> {
    await mongo.connect();
    await Promise.all(OWNED_MODELS.map((model) => model.deleteMany({ userId }).exec()));
    const result = await UserModel.deleteOne({ _id: userId }).exec();
    return result.deletedCount > 0;
  },
};
