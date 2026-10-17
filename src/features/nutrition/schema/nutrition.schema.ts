import mongoose, { InferSchemaType, Schema } from 'mongoose';

const NutritionTargetsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    calories: { type: Number, min: 500, max: 10000, required: true },
    proteinGrams: { type: Number, min: 0, max: 1000, required: true },
    carbohydrateGrams: { type: Number, min: 0, max: 1500, required: true },
    fatGrams: { type: Number, min: 0, max: 500, required: true },
    fiberGrams: { type: Number, min: 0, max: 200, required: true },
    waterMl: { type: Number, min: 0, max: 10000, required: true },
  },
  { timestamps: true }
);

const NutritionEntrySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: { type: String, required: true, index: true },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    foodName: { type: String, required: true, maxlength: 120 },
    calories: { type: Number, min: 0, max: 10000, required: true },
    proteinGrams: { type: Number, min: 0, max: 1000, required: true },
    carbohydrateGrams: { type: Number, min: 0, max: 1500, required: true },
    fatGrams: { type: Number, min: 0, max: 500, required: true },
    fiberGrams: { type: Number, min: 0, max: 200, required: true },
    waterMl: { type: Number, min: 0, max: 10000 },
    notes: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

export type NutritionTargetsDocument = InferSchemaType<
  typeof NutritionTargetsSchema
> & { _id: mongoose.Types.ObjectId };

export type NutritionEntryDocument = InferSchemaType<
  typeof NutritionEntrySchema
> & { _id: mongoose.Types.ObjectId };

export const NutritionTargetsModel =
  mongoose.models.NutritionTargets ||
  mongoose.model('NutritionTargets', NutritionTargetsSchema);

export const NutritionEntryModel =
  mongoose.models.NutritionEntry ||
  mongoose.model('NutritionEntry', NutritionEntrySchema);
