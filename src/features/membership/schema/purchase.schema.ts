import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const PurchaseSchema = new Schema({
  userId: { type: String, required: true, index: true },
  environment: { type: String, enum: ['test_mode', 'live_mode'], required: true },
  // 'consultation' stays valid so purchases made before consultations were removed still load.
  kind: { type: String, enum: ['premium', 'consultation'], required: true },
  productId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded', 'expired'], default: 'pending', required: true },
  checkoutSessionId: String,
  checkoutUrl: String,
  expiresAt: { type: Date, required: true },
  paymentId: String,
  customerId: String,
  subscriptionId: String,
  subscriptionStatus: String,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: { type: Boolean, default: false, required: true },
  latestEventAt: { type: Date, default: () => new Date(0), required: true },
  refundedPeriodEnd: Date,
}, { timestamps: true });

PurchaseSchema.index({ userId: 1, environment: 1, kind: 1 }, {
  unique: true, partialFilterExpression: { status: 'pending' },
});
PurchaseSchema.index({ environment: 1, subscriptionId: 1 }, {
  unique: true, partialFilterExpression: { subscriptionId: { $type: 'string' } },
});

export type PurchaseDocument = InferSchemaType<typeof PurchaseSchema> & { _id: mongoose.Types.ObjectId };
export const PurchaseModel = mongoose.models.BillingPurchase || mongoose.model('BillingPurchase', PurchaseSchema);
