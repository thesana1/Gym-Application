import mongoose, { InferSchemaType, Schema } from 'mongoose';

const ConsultationRequestSchema = new Schema(
  {
    memberUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coachUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coachProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'CoachProfile',
      required: true,
    },
    coachName: { type: String, required: true, maxlength: 80 },
    topic: { type: String, required: true, maxlength: 120 },
    message: { type: String, required: true, maxlength: 1200 },
    preferredAvailability: { type: String, maxlength: 300 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'cancelled'],
      default: 'pending',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export type ConsultationRequestDocument =
  InferSchemaType<typeof ConsultationRequestSchema> & {
    _id: mongoose.Types.ObjectId;
  };

export const ConsultationRequestModel =
  mongoose.models.ConsultationRequest ||
  mongoose.model('ConsultationRequest', ConsultationRequestSchema);
