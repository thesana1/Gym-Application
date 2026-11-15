import mongoose, { InferSchemaType, Schema } from 'mongoose';

import { AI_REQUEST_KINDS } from '@/shared/const/ai.const';

const AiResultSchema = new Schema(
  {
    // Absent for results shared by every user (e.g. a general exercise explanation).
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    kind: { type: String, enum: AI_REQUEST_KINDS, required: true },
    cacheKey: { type: String, required: true, unique: true },
    label: { type: String, required: true, maxlength: 600 },
    // Validated JSON; re-validated with the feature's Zod schema on every read.
    result: { type: String, required: true },
    model: { type: String, required: true },
  },
  { timestamps: true }
);

AiResultSchema.index({ userId: 1, kind: 1, createdAt: -1 });

export type AiResultDocument = InferSchemaType<typeof AiResultSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AiResultModel = mongoose.models.AiResult || mongoose.model('AiResult', AiResultSchema);
