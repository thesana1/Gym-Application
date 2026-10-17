import {
  FitnessProfileDocument,
  FitnessProfileModel,
} from '@/features/fitness/schema/fitness-profile.schema';
import { FitnessProfileType } from '@/features/fitness/validations/fitness-profile.validation';
import { mongo } from '@/shared/lib/mongo';

type TrainingScheduleAssignment = {
  weekday: number;
  sessionIndex: number;
};

type WorkoutPlanOverride = {
  sessionIndex: number;
  exerciseIds: string[];
};

export const fitnessProfileRepository = {
  async findByUserId(userId: string): Promise<FitnessProfileDocument | null> {
    await mongo.connect();
    return FitnessProfileModel.findOne({ userId })
      .lean<FitnessProfileDocument>()
      .exec();
  },

  async upsertByUserId(
    userId: string,
    profile: FitnessProfileType
  ): Promise<FitnessProfileDocument | null> {
    await mongo.connect();
    return FitnessProfileModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...profile,
          userId,
          age: profile.age ?? null,
          heightCm: profile.heightCm ?? null,
          weightKg: profile.weightKg ?? null,
          trainingDaysPerWeek: profile.trainingDaysPerWeek ?? null,
        },
      },
      { new: true, upsert: true, runValidators: true }
    )
      .lean<FitnessProfileDocument>()
      .exec();
  },

  async updateTrainingScheduleByUserId(
    userId: string,
    trainingSchedule: TrainingScheduleAssignment[]
  ): Promise<FitnessProfileDocument | null> {
    await mongo.connect();
    return FitnessProfileModel.findOneAndUpdate(
      { userId },
      { $set: { trainingSchedule } },
      { new: true, runValidators: true }
    )
      .lean<FitnessProfileDocument>()
      .exec();
  },

  async updateWorkoutPlanOverridesByUserId(
    userId: string,
    workoutPlanOverrides: WorkoutPlanOverride[]
  ): Promise<FitnessProfileDocument | null> {
    await mongo.connect();
    return FitnessProfileModel.findOneAndUpdate(
      { userId },
      { $set: { workoutPlanOverrides } },
      { new: true, runValidators: true }
    )
      .lean<FitnessProfileDocument>()
      .exec();
  },
};
