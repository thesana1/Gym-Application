import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const CatalogSchema = new Schema({
  key: { type: String, required: true, unique: true },
  productId: { type: String, default: '' },
  leaseUntil: { type: Date, required: true },
}, { timestamps: true });

export type CatalogDocument = InferSchemaType<typeof CatalogSchema> & { _id: mongoose.Types.ObjectId };
export const CatalogModel = mongoose.models.BillingCatalog || mongoose.model('BillingCatalog', CatalogSchema);
