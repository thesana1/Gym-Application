import mongoose, { InferSchemaType, Schema } from 'mongoose';

const ProgressMeasurementSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: { type: String, required: true, index: true },
    weightKg: { type: Number, min: 30, max: 350 },
    waistCm: { type: Number, min: 20, max: 300 },
    hipsCm: { type: Number, min: 20, max: 300 },
    chestCm: { type: Number, min: 20, max: 300 },
    armCm: { type: Number, min: 10, max: 150 },
    thighCm: { type: Number, min: 20, max: 200 },
    notes: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

export type ProgressMeasurementDocument = InferSchemaType<
  typeof ProgressMeasurementSchema
> & { _id: mongoose.Types.ObjectId };

export const ProgressMeasurementModel =
  mongoose.models.ProgressMeasurement ||
  mongoose.model('ProgressMeasurement', ProgressMeasurementSchema);
