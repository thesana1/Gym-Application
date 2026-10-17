import {
  CoachProfileModel,
  type CoachProfileDocument,
} from '@/features/coaches/schema/coach-profile.schema';
import {
  ConsultationRequestModel,
  type ConsultationRequestDocument,
} from '@/features/coaches/schema/consultation-request.schema';
import type { CoachDirectoryQuery, CoachProfileType } from '@/features/coaches/validations/coach.validation';
import type { ConsultationRequestType } from '@/features/coaches/validations/coach.validation';
import { mongo } from '@/shared/lib/mongo';

const escapeRegularExpression = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const coachRepository = {
  async findVerified(
    query: CoachDirectoryQuery
  ): Promise<CoachProfileDocument[]> {
    await mongo.connect();
    const filter = {
      verificationStatus: 'verified',
      ...(query.specialization
        ? { specializations: query.specialization }
        : {}),
      ...(query.language
        ? { languages: { $regex: `^${escapeRegularExpression(query.language)}$`, $options: 'i' } }
        : {}),
      ...(query.search
        ? {
          $or: [
            { displayName: { $regex: escapeRegularExpression(query.search), $options: 'i' } },
            { bio: { $regex: escapeRegularExpression(query.search), $options: 'i' } },
          ],
        }
        : {}),
    };
    return CoachProfileModel.find(filter)
      .sort({ displayName: 1 })
      .lean<CoachProfileDocument[]>()
      .exec();
  },

  async findByCoachUserId(
    coachUserId: string
  ): Promise<CoachProfileDocument | null> {
    await mongo.connect();
    return CoachProfileModel.findOne({ coachUserId })
      .lean<CoachProfileDocument>()
      .exec();
  },

  async findByProfileId(
    profileId: string
  ): Promise<CoachProfileDocument | null> {
    await mongo.connect();
    return CoachProfileModel.findById(profileId)
      .lean<CoachProfileDocument>()
      .exec();
  },

  async saveProfile(
    coachUserId: string,
    profile: CoachProfileType
  ): Promise<CoachProfileDocument | null> {
    await mongo.connect();
    return CoachProfileModel.findOneAndUpdate(
      { coachUserId },
      {
        $set: {
          ...profile,
          coachUserId,
          verificationStatus: 'pending',
        },
        $inc: { revision: 1 },
        $unset: { reviewedBy: 1, reviewedAt: 1 },
      },
      { new: true, upsert: true, runValidators: true }
    )
      .lean<CoachProfileDocument>()
      .exec();
  },

  async findForModeration(): Promise<CoachProfileDocument[]> {
    await mongo.connect();
    return CoachProfileModel.find({
      verificationStatus: { $in: ['pending', 'verified'] },
    })
      .sort({ updatedAt: -1 })
      .lean<CoachProfileDocument[]>()
      .exec();
  },

  async moderate(
    profileId: string,
    reviewedBy: string,
    decision: 'verified' | 'rejected',
    expectedRevision: number
  ): Promise<CoachProfileDocument | null> {
    await mongo.connect();
    return CoachProfileModel.findOneAndUpdate(
      { _id: profileId, revision: expectedRevision },
      {
        $set: {
          verificationStatus: decision,
          reviewedBy,
          reviewedAt: new Date(),
        },
        $inc: { revision: 1 },
      },
      { new: true, runValidators: true }
    )
      .lean<CoachProfileDocument>()
      .exec();
  },

  async createRequest(
    memberUserId: string,
    coachUserId: string,
    request: ConsultationRequestType,
    coachProfileId: string,
    coachName: string
  ): Promise<ConsultationRequestDocument | null> {
    await mongo.connect();
    const document = await ConsultationRequestModel.create({
      ...request,
      memberUserId,
      coachUserId,
      coachProfileId,
      coachName,
      status: 'pending',
    });
    return ConsultationRequestModel.findById(document._id)
      .lean<ConsultationRequestDocument>()
      .exec();
  },

  async findMemberRequests(
    memberUserId: string
  ): Promise<ConsultationRequestDocument[]> {
    await mongo.connect();
    return ConsultationRequestModel.find({ memberUserId })
      .sort({ createdAt: -1 })
      .lean<ConsultationRequestDocument[]>()
      .exec();
  },

  async findCoachRequests(
    coachUserId: string
  ): Promise<ConsultationRequestDocument[]> {
    await mongo.connect();
    return ConsultationRequestModel.find({ coachUserId })
      .sort({ createdAt: -1 })
      .lean<ConsultationRequestDocument[]>()
      .exec();
  },

  async updateRequestAsMember(
    requestId: string,
    memberUserId: string
  ): Promise<ConsultationRequestDocument | null> {
    await mongo.connect();
    return ConsultationRequestModel.findOneAndUpdate(
      { _id: requestId, memberUserId, status: { $in: ['pending', 'accepted'] } },
      { $set: { status: 'cancelled' } },
      { new: true, runValidators: true }
    )
      .lean<ConsultationRequestDocument>()
      .exec();
  },

  async updateRequestAsCoach(
    requestId: string,
    coachUserId: string,
    status: 'accepted' | 'declined'
  ): Promise<ConsultationRequestDocument | null> {
    await mongo.connect();
    return ConsultationRequestModel.findOneAndUpdate(
      { _id: requestId, coachUserId, status: 'pending' },
      { $set: { status } },
      { new: true, runValidators: true }
    )
      .lean<ConsultationRequestDocument>()
      .exec();
  },
};
