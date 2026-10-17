import mongoose, { InferSchemaType, Schema } from 'mongoose';

import { COACH_SPECIALIZATIONS } from '@/shared/const/coaching.const';

const CoachQualificationSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 120 },
  },
  { _id: false }
);

const CoachProfileSchema = new Schema(
  {
    coachUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    displayName: { type: String, required: true, maxlength: 80 },
    bio: { type: String, required: true, maxlength: 1200 },
    experienceYears: { type: Number, required: true, min: 0, max: 60 },
    qualifications: { type: [CoachQualificationSchema], required: true },
    specializations: {
      type: [{ type: String, enum: COACH_SPECIALIZATIONS }],
      required: true,
    },
    languages: { type: [{ type: String, maxlength: 40 }], required: true },
    availabilityNote: { type: String, maxlength: 300 },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      required: true,
      index: true,
    },
    revision: { type: Number, default: 0, required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export type CoachProfileDocument = InferSchemaType<typeof CoachProfileSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CoachProfileModel =
  mongoose.models.CoachProfile ||
  mongoose.model('CoachProfile', CoachProfileSchema);
