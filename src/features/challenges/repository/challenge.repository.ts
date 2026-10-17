import {
  ChallengeEnrollmentModel,
  type ChallengeEnrollmentDocument,
} from '@/features/challenges/schema/challenge-enrollment.schema';
import { mongo } from '@/shared/lib/mongo';

export const challengeRepository = {
  async findByUserId(
    userId: string
  ): Promise<ChallengeEnrollmentDocument[]> {
    await mongo.connect();
    return ChallengeEnrollmentModel.find({ userId })
      .sort({ joinedAt: -1 })
      .lean<ChallengeEnrollmentDocument[]>()
      .exec();
  },

  async join(
    userId: string,
    challengeId: string,
    joinedAt: Date
  ): Promise<ChallengeEnrollmentDocument | null> {
    await mongo.connect();
    return ChallengeEnrollmentModel.findOneAndUpdate(
      { userId, challengeId },
      { $setOnInsert: { userId, challengeId, joinedAt } },
      { new: true, upsert: true, runValidators: true }
    )
      .lean<ChallengeEnrollmentDocument>()
      .exec();
  },

  async leave(userId: string, challengeId: string): Promise<boolean> {
    await mongo.connect();
    const result = await ChallengeEnrollmentModel.deleteOne({
      userId,
      challengeId,
    });
    return result.deletedCount > 0;
  },
};
