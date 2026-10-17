import mongoose, { InferSchemaType, Schema } from 'mongoose';

const WorkoutSetSchema = new Schema(
  {
    repetitions: { type: Number, required: true, min: 1, max: 100 },
    weightKg: { type: Number, min: 0, max: 500 },
  },
  { _id: false }
);

const WorkoutExerciseSchema = new Schema(
  {
    exerciseId: { type: String, required: true, maxlength: 80 },
    exerciseName: { type: String, required: true, maxlength: 100 },
    sets: { type: [WorkoutSetSchema], required: true },
  },
  { _id: false }
);

const WorkoutLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, maxlength: 80 },
    completedAt: { type: Date, required: true, index: true },
    notes: { type: String, maxlength: 1000 },
    exercises: { type: [WorkoutExerciseSchema], required: true },
  },
  { timestamps: true }
);

export type WorkoutLogDocument = InferSchemaType<typeof WorkoutLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const WorkoutLogModel =
  mongoose.models.WorkoutLog || mongoose.model('WorkoutLog', WorkoutLogSchema);
