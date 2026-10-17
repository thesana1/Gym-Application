import mongoose, { InferSchemaType, Schema } from 'mongoose';

import {
  AVAILABLE_EQUIPMENT,
  FITNESS_GOALS,
  TRAINING_EXPERIENCE_LEVELS,
} from '@/shared/const/fitness.const';

const FitnessProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    goal: {
      type: String,
      enum: FITNESS_GOALS.map(({ value }) => value),
      required: true,
    },
    experience: {
      type: String,
      enum: TRAINING_EXPERIENCE_LEVELS.map(({ value }) => value),
      required: true,
    },
    age: { type: Number, min: 13, max: 100 },
    heightCm: { type: Number, min: 100, max: 250 },
    weightKg: { type: Number, min: 30, max: 350 },
    trainingDaysPerWeek: { type: Number, min: 1, max: 7 },
    availableEquipment: {
      type: [String],
      enum: AVAILABLE_EQUIPMENT.map(({ value }) => value),
      default: [],
    },
    trainingSchedule: {
      type: [
        new Schema(
          {
            weekday: { type: Number, min: 0, max: 6, required: true },
            sessionIndex: { type: Number, min: 0, max: 2, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    workoutPlanOverrides: {
      type: [
        new Schema(
          {
            sessionIndex: { type: Number, min: 0, max: 2, required: true },
            exerciseIds: {
              type: [String],
              required: true,
              validate: {
                validator: (values: string[]) =>
                  values.length >= 1 && values.length <= 5,
                message: 'A plan session must contain between one and five exercises',
              },
            },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export type FitnessProfileDocument = InferSchemaType<typeof FitnessProfileSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const FitnessProfileModel =
  mongoose.models.FitnessProfile ||
  mongoose.model('FitnessProfile', FitnessProfileSchema);
