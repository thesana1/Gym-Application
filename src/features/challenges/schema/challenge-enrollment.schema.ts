import mongoose, { InferSchemaType, Schema } from 'mongoose';

const ChallengeEnrollmentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    challengeId: { type: String, required: true, maxlength: 80 },
    joinedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

ChallengeEnrollmentSchema.index(
  { userId: 1, challengeId: 1 },
  { unique: true }
);

export type ChallengeEnrollmentDocument =
  InferSchemaType<typeof ChallengeEnrollmentSchema> & {
    _id: mongoose.Types.ObjectId;
  };

export const ChallengeEnrollmentModel =
  mongoose.models.ChallengeEnrollment ||
  mongoose.model('ChallengeEnrollment', ChallengeEnrollmentSchema);
