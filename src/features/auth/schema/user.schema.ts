import mongoose, { Schema, InferSchemaType } from 'mongoose';

const MembershipSchema = new Schema(
  {
    tier: {
      type: String,
      enum: ['vip', 'vipplus', 'supervip'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'on_hold', 'paused', 'cancelled', 'failed', 'expired', 'past_due'],
      required: true,
    },
    subscriptionId: { type: String, required: true },
    customerId: { type: String, required: false },
    nextBillingDate: { type: Date, required: false },
    cancelAtPeriodEnd: { type: Boolean, default: false, required: true },
    lastEventAt: { type: Date, required: true },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: false, default: '' },
    avatar: { type: String, required: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
    membership: { type: MembershipSchema, default: null },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserModel =
  mongoose.models.User || mongoose.model('User', UserSchema);
