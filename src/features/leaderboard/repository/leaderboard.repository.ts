import { UserDocument, UserModel } from '@/features/auth/schema/user.schema';
import { WorkoutLogModel } from '@/features/fitness/schema/workout-log.schema';
import { mongo } from '@/shared/lib/mongo';

export type HeaviestRow = { _id: string; weightKg: number };
export type BestEstimateRow = { _id: { userId: string; exerciseId: string; recent: boolean }; best: number };

export const leaderboardRepository = {
  async findHeaviestByUser(exerciseIds: string[]): Promise<HeaviestRow[]> {
    await mongo.connect();
    return WorkoutLogModel.aggregate<HeaviestRow>([
      { $match: { 'exercises.exerciseId': { $in: exerciseIds } } },
      { $unwind: '$exercises' },
      { $match: { 'exercises.exerciseId': { $in: exerciseIds } } },
      { $unwind: '$exercises.sets' },
      { $match: { 'exercises.sets.weightKg': { $gt: 0 } } },
      { $group: { _id: { $toString: '$userId' }, weightKg: { $max: '$exercises.sets.weightKg' } } },
    ]).exec();
  },

  // Best estimated one-rep max (Epley: weight × (1 + reps / 30)) per user and lift, split into before and after `since`.
  async findBestEstimates(since: Date): Promise<BestEstimateRow[]> {
    await mongo.connect();
    return WorkoutLogModel.aggregate<BestEstimateRow>([
      { $unwind: '$exercises' },
      { $unwind: '$exercises.sets' },
      { $match: { 'exercises.sets.weightKg': { $gt: 0 } } },
      {
        $group: {
          _id: { userId: { $toString: '$userId' }, exerciseId: '$exercises.exerciseId', recent: { $gte: ['$completedAt', since] } },
          best: { $max: { $multiply: ['$exercises.sets.weightKg', { $add: [1, { $divide: ['$exercises.sets.repetitions', 30] }] }] } },
        },
      },
    ]).exec();
  },

  async findNames(userIds: string[]): Promise<Pick<UserDocument, '_id' | 'name'>[]> {
    await mongo.connect();
    return UserModel.find({ _id: { $in: userIds } }, { name: 1 }).lean<Pick<UserDocument, '_id' | 'name'>[]>().exec();
  },
};
