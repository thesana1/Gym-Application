import mongoose, { InferSchemaType, Schema } from 'mongoose';

const AiUsageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // UTC calendar day, e.g. "2026-11-14".
    day: { type: String, required: true },
    count: { type: Number, required: true, default: 0, min: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

AiUsageSchema.index({ userId: 1, day: 1 }, { unique: true });
AiUsageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type AiUsageDocument = InferSchemaType<typeof AiUsageSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AiUsageModel = mongoose.models.AiUsage || mongoose.model('AiUsage', AiUsageSchema);
