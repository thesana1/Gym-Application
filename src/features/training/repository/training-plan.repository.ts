import { TrainingPlanDocument, TrainingPlanModel } from '@/features/training/schema/training-plan.schema';
import type { TrainingPlanType } from '@/features/training/validations/training-plan.validation';
import { mongo } from '@/shared/lib/mongo';

export const trainingPlanRepository = {
  async findByUserId(userId: string): Promise<TrainingPlanDocument | null> {
    await mongo.connect();
    return TrainingPlanModel.findOne({ userId }).lean<TrainingPlanDocument>().exec();
  },

  async upsertByUserId(userId: string, plan: TrainingPlanType): Promise<TrainingPlanDocument | null> {
    await mongo.connect();
    return TrainingPlanModel.findOneAndUpdate({ userId }, { $set: { ...plan, userId } }, { new: true, upsert: true, runValidators: true })
      .lean<TrainingPlanDocument>()
      .exec();
  },

  async deleteByUserId(userId: string): Promise<boolean> {
    await mongo.connect();
    const result = await TrainingPlanModel.deleteOne({ userId }).exec();
    return result.deletedCount > 0;
  },
};
