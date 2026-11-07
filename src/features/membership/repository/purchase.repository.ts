import { PurchaseModel, type PurchaseDocument } from '@/features/membership/schema/purchase.schema';
import type { BillingEnvironment, PurchaseKind } from '@/features/membership/types/payment.types';
import { mongo } from '@/shared/lib/mongo';

export const purchaseRepository = {
  async findForUser(userId: string, environment: BillingEnvironment): Promise<PurchaseDocument[]> {
    await mongo.connect();
    return PurchaseModel.find({ userId, environment }).sort({ createdAt: -1 }).lean<PurchaseDocument[]>().exec();
  },
  async findById(id: string, environment: BillingEnvironment): Promise<PurchaseDocument | null> {
    await mongo.connect();
    return PurchaseModel.findOne({ _id: id, environment }).lean<PurchaseDocument>().exec();
  },
  async create(data: { userId: string; environment: BillingEnvironment; kind: PurchaseKind; productId: string; expiresAt: Date }) {
    await mongo.connect();
    await PurchaseModel.init();
    const purchase: PurchaseDocument = await PurchaseModel.create(data);
    return purchase._id.toString();
  },
  async update(id: string, data: Partial<PurchaseDocument>) {
    await mongo.connect();
    return PurchaseModel.updateOne({ _id: id }, { $set: data });
  },
  async applyEvent(id: string, timestamp: Date, data: Partial<PurchaseDocument>) {
    await mongo.connect();
    return PurchaseModel.updateOne({ _id: id, latestEventAt: { $lte: timestamp } }, {
      $set: { ...data, latestEventAt: timestamp },
    });
  },
  async expirePending(userId: string, environment: BillingEnvironment, now: Date) {
    await mongo.connect();
    return PurchaseModel.updateMany({ userId, environment, status: 'pending', expiresAt: { $lte: now } }, {
      $set: { status: 'expired' },
    });
  },
  async recordRefund(id: string, periodEnd: Date) {
    await mongo.connect();
    return PurchaseModel.updateOne({ _id: id }, { $max: { refundedPeriodEnd: periodEnd } });
  },
};
