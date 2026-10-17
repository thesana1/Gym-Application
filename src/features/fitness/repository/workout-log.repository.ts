import {
  WorkoutLogDocument,
  WorkoutLogModel,
} from '@/features/fitness/schema/workout-log.schema';
import { WorkoutLogQuery, WorkoutLogType } from '@/features/fitness/validations/workout-log.validation';
import { mongo } from '@/shared/lib/mongo';

export const workoutLogRepository = {
  async findByUserId(
    userId: string,
    query: WorkoutLogQuery
  ): Promise<WorkoutLogDocument[]> {
    await mongo.connect();
    const filter: {
      userId: string;
      completedAt?: { $gte?: Date; $lte?: Date };
      'exercises.exerciseId'?: string;
    } = { userId };

    if (query.from || query.to) {
      filter.completedAt = {
        ...(query.from ? { $gte: new Date(query.from) } : {}),
        ...(query.to ? { $lte: new Date(query.to) } : {}),
      };
    }

    if (query.exerciseId) {
      filter['exercises.exerciseId'] = query.exerciseId;
    }

    return WorkoutLogModel.find(filter)
      .sort({ completedAt: -1 })
      .lean<WorkoutLogDocument[]>()
      .exec();
  },

  async create(
    userId: string,
    workout: WorkoutLogType & { completedAt: Date; exercises: WorkoutLogType['exercises'][number][] }
  ): Promise<WorkoutLogDocument | null> {
    await mongo.connect();
    const document = await WorkoutLogModel.create({ ...workout, userId });
    return WorkoutLogModel.findOne({ _id: document._id, userId })
      .lean<WorkoutLogDocument>()
      .exec();
  },

  async updateById(
    userId: string,
    workoutId: string,
    workout: WorkoutLogType & { completedAt: Date; exercises: WorkoutLogType['exercises'][number][] }
  ): Promise<WorkoutLogDocument | null> {
    await mongo.connect();
    return WorkoutLogModel.findOneAndUpdate(
      { _id: workoutId, userId },
      { $set: workout },
      { new: true, runValidators: true }
    )
      .lean<WorkoutLogDocument>()
      .exec();
  },

  async deleteById(userId: string, workoutId: string): Promise<boolean> {
    await mongo.connect();
    const result = await WorkoutLogModel.deleteOne({ _id: workoutId, userId });
    return result.deletedCount > 0;
  },
};
