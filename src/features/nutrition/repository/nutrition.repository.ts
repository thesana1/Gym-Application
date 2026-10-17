import {
  NutritionEntryDocument,
  NutritionEntryModel,
  NutritionTargetsDocument,
  NutritionTargetsModel,
} from '@/features/nutrition/schema/nutrition.schema';
import {
  NutritionEntryType,
  NutritionTargetsType,
} from '@/features/nutrition/validations/nutrition.validation';
import { mongo } from '@/shared/lib/mongo';

export const nutritionRepository = {
  async findTargetsByUserId(
    userId: string
  ): Promise<NutritionTargetsDocument | null> {
    await mongo.connect();
    return NutritionTargetsModel.findOne({ userId })
      .lean<NutritionTargetsDocument>()
      .exec();
  },

  async upsertTargets(
    userId: string,
    targets: NutritionTargetsType
  ): Promise<NutritionTargetsDocument | null> {
    await mongo.connect();
    return NutritionTargetsModel.findOneAndUpdate(
      { userId },
      { $set: { ...targets, userId } },
      { new: true, upsert: true, runValidators: true }
    )
      .lean<NutritionTargetsDocument>()
      .exec();
  },

  async findEntriesByUserAndDate(
    userId: string,
    date: string
  ): Promise<NutritionEntryDocument[]> {
    await mongo.connect();
    return NutritionEntryModel.find({ userId, date })
      .sort({ mealType: 1, createdAt: 1 })
      .lean<NutritionEntryDocument[]>()
      .exec();
  },

  async findEntriesByUserAndDateRange(
    userId: string,
    from: string,
    to: string
  ): Promise<NutritionEntryDocument[]> {
    await mongo.connect();
    return NutritionEntryModel.find({
      userId,
      date: { $gte: from, $lte: to },
    })
      .sort({ date: 1, mealType: 1, createdAt: 1 })
      .lean<NutritionEntryDocument[]>()
      .exec();
  },

  async createEntry(
    userId: string,
    entry: NutritionEntryType
  ): Promise<NutritionEntryDocument | null> {
    await mongo.connect();
    const document = await NutritionEntryModel.create({ ...entry, userId });
    return NutritionEntryModel.findOne({ _id: document._id, userId })
      .lean<NutritionEntryDocument>()
      .exec();
  },

  async updateEntry(
    userId: string,
    entryId: string,
    entry: NutritionEntryType
  ): Promise<NutritionEntryDocument | null> {
    await mongo.connect();
    return NutritionEntryModel.findOneAndUpdate(
      { _id: entryId, userId },
      {
        $set: entry,
        $unset: {
          ...(entry.waterMl === undefined ? { waterMl: 1 } : {}),
          ...(entry.notes === undefined ? { notes: 1 } : {}),
        },
      },
      { new: true, runValidators: true }
    )
      .lean<NutritionEntryDocument>()
      .exec();
  },

  async deleteEntry(userId: string, entryId: string): Promise<boolean> {
    await mongo.connect();
    const result = await NutritionEntryModel.deleteOne({ _id: entryId, userId });
    return result.deletedCount > 0;
  },
};
