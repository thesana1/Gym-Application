import { ProgressMeasurementDocument, ProgressMeasurementModel } from '@/features/fitness/schema/progress-measurement.schema';
import { ProgressMeasurementType } from '@/features/fitness/validations/progress-measurement.validation';
import { mongo } from '@/shared/lib/mongo';

export const progressMeasurementRepository = {
  async findByUserId(userId: string): Promise<ProgressMeasurementDocument[]> {
    await mongo.connect();
    return ProgressMeasurementModel.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .lean<ProgressMeasurementDocument[]>()
      .exec();
  },

  async create(
    userId: string,
    measurement: ProgressMeasurementType
  ): Promise<ProgressMeasurementDocument | null> {
    await mongo.connect();
    const document = await ProgressMeasurementModel.create({
      ...measurement,
      userId,
    });
    return ProgressMeasurementModel.findOne({ _id: document._id, userId })
      .lean<ProgressMeasurementDocument>()
      .exec();
  },

  async updateById(
    userId: string,
    measurementId: string,
    measurement: ProgressMeasurementType
  ): Promise<ProgressMeasurementDocument | null> {
    await mongo.connect();
    return ProgressMeasurementModel.findOneAndUpdate(
      { _id: measurementId, userId },
      {
        $set: measurement,
        $unset: {
          ...(measurement.weightKg === undefined ? { weightKg: 1 } : {}),
          ...(measurement.waistCm === undefined ? { waistCm: 1 } : {}),
          ...(measurement.hipsCm === undefined ? { hipsCm: 1 } : {}),
          ...(measurement.chestCm === undefined ? { chestCm: 1 } : {}),
          ...(measurement.armCm === undefined ? { armCm: 1 } : {}),
          ...(measurement.thighCm === undefined ? { thighCm: 1 } : {}),
          ...(measurement.notes === undefined ? { notes: 1 } : {}),
        },
      },
      { new: true, runValidators: true }
    )
      .lean<ProgressMeasurementDocument>()
      .exec();
  },

  async deleteById(userId: string, measurementId: string): Promise<boolean> {
    await mongo.connect();
    const result = await ProgressMeasurementModel.deleteOne({
      _id: measurementId,
      userId,
    });
    return result.deletedCount > 0;
  },
};
