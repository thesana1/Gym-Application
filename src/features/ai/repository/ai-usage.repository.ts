import { AiUsageDocument, AiUsageModel } from '@/features/ai/schema/ai-usage.schema';
import { mongo } from '@/shared/lib/mongo';

export const aiUsageRepository = {
  async findByUserAndDay(userId: string, day: string): Promise<AiUsageDocument | null> {
    await mongo.connect();
    return AiUsageModel.findOne({ userId, day }).lean<AiUsageDocument>().exec();
  },

  // Atomically takes one request slot. When the user is already at the limit the
  // filter misses, the upsert collides with the unique index and Mongo throws E11000.
  async reserve(userId: string, day: string, limit: number, expiresAt: Date): Promise<AiUsageDocument | null> {
    await mongo.connect();
    return AiUsageModel.findOneAndUpdate(
      { userId, day, count: { $lt: limit } },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { new: true, upsert: true }
    )
      .lean<AiUsageDocument>()
      .exec();
  },

  async release(userId: string, day: string): Promise<void> {
    await mongo.connect();
    await AiUsageModel.updateOne({ userId, day, count: { $gt: 0 } }, { $inc: { count: -1 } }).exec();
  },
};
