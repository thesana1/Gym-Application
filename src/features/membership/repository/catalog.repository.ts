import { CatalogModel, type CatalogDocument } from '@/features/membership/schema/catalog.schema';
import { mongo } from '@/shared/lib/mongo';

export const catalogRepository = {
  async initialize(key: string) {
    await mongo.connect();
    await CatalogModel.init();
    return CatalogModel.updateOne({ key }, { $setOnInsert: { key, productId: '', leaseUntil: new Date(0) } }, { upsert: true });
  },
  async find(key: string): Promise<CatalogDocument | null> {
    await mongo.connect();
    return CatalogModel.findOne({ key }).lean<CatalogDocument>().exec();
  },
  async claim(key: string, now: Date, leaseUntil: Date): Promise<CatalogDocument | null> {
    await mongo.connect();
    return CatalogModel.findOneAndUpdate({ key, productId: '', leaseUntil: { $lte: now } }, {
      $set: { leaseUntil },
    }, { new: true }).lean<CatalogDocument>().exec();
  },
  async complete(key: string, leaseUntil: Date, productId: string) {
    await mongo.connect();
    return CatalogModel.updateOne({ key, leaseUntil }, { $set: { productId, leaseUntil: new Date(0) } });
  },
};
