import mongoose, { InferSchemaType, Schema } from 'mongoose';

import { FITNESS_GOALS } from '@/shared/const/fitness.const';
import { FOCUS_AREAS, TRAINING_LIMITS } from '@/shared/const/training.const';

const PlanExerciseSchema = new Schema(
  {
    exerciseId: { type: String, required: true, maxlength: 80 },
    sets: { type: Number, required: true, min: TRAINING_LIMITS.minSets, max: TRAINING_LIMITS.maxSets },
    repMin: { type: Number, required: true, min: TRAINING_LIMITS.minReps, max: TRAINING_LIMITS.maxReps },
    repMax: { type: Number, required: true, min: TRAINING_LIMITS.minReps, max: TRAINING_LIMITS.maxReps },
    restSeconds: { type: Number, required: true, min: TRAINING_LIMITS.minRest, max: TRAINING_LIMITS.maxRest },
  },
  { _id: false }
);

const PlanWorkoutSchema = new Schema(
  {
    id: { type: String, required: true, maxlength: 40 },
    name: { type: String, required: true, maxlength: TRAINING_LIMITS.maxNameLength },
    // null keeps a workout in the plan without putting it on the calendar.
    weekday: { type: Number, min: 0, max: 6, default: null },
    exercises: { type: [PlanExerciseSchema], required: true },
  },
  { _id: false }
);

const TrainingPlanSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    goal: { type: String, enum: FITNESS_GOALS.map(({ value }) => value), required: true },
    focusAreas: { type: [String], enum: FOCUS_AREAS.map(({ value }) => value), default: [] },
    source: { type: String, enum: ['ai', 'library', 'manual'], required: true },
    workouts: { type: [PlanWorkoutSchema], required: true },
  },
  { timestamps: true }
);

export type TrainingPlanDocument = InferSchemaType<typeof TrainingPlanSchema> & { _id: mongoose.Types.ObjectId };

export const TrainingPlanModel = mongoose.models.TrainingPlan || mongoose.model('TrainingPlan', TrainingPlanSchema);
