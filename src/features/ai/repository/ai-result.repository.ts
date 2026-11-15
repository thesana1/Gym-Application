import { AiResultDocument, AiResultModel } from '@/features/ai/schema/ai-result.schema';
import type { AiRequestKind } from '@/shared/const/ai.const';
import { mongo } from '@/shared/lib/mongo';

export type NewAiResult = {
  userId?: string;
  kind: AiRequestKind;
  cacheKey: string;
  label: string;
  result: string;
  model: string;
};

export const aiResultRepository = {
  async findByCacheKey(cacheKey: string): Promise<AiResultDocument | null> {
    await mongo.connect();
    return AiResultModel.findOne({ cacheKey }).lean<AiResultDocument>().exec();
  },

  async create(data: NewAiResult): Promise<string> {
    await mongo.connect();
    const doc = await AiResultModel.create(data);
    return doc._id.toString();
  },

  async findRecentByUserAndKind(userId: string, kind: AiRequestKind, limit: number): Promise<AiResultDocument[]> {
    await mongo.connect();
    return AiResultModel.find({ userId, kind }).sort({ createdAt: -1 }).limit(limit).lean<AiResultDocument[]>().exec();
  },
};
