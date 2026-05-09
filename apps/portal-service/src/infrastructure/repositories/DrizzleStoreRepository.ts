import { db, stores, merchants, eq } from '@lightning/database';
import { IStoreRepository } from '../../application/repositories/IStoreRepository';
import { Store } from '../../domain/entities/Store';

export class DrizzleStoreRepository implements IStoreRepository {
  async getById(id: string): Promise<Store | null> {
    const result = await db.select({
      store: stores,
      merchantUid: merchants.uid
    })
    .from(stores)
    .innerJoin(merchants, eq(stores.merchantId, merchants.id))
    .where(eq(stores.uid, id))
    .limit(1);

    if (result.length === 0) return null;

    const { store, merchantUid } = result[0];
    return new Store(
      store.uid,
      merchantUid,
      store.name,
      store.address || '',
      Number(store.latitude || 0),
      Number(store.longitude || 0)
    );
  }

  async getByMerchantId(merchantId: string): Promise<Store[]> {
    const result = await db.select({
      store: stores,
      merchantUid: merchants.uid
    })
    .from(stores)
    .innerJoin(merchants, eq(stores.merchantId, merchants.id))
    .where(eq(merchants.uid, merchantId));

    return result.map(({ store, merchantUid }) => new Store(
      store.uid,
      merchantUid,
      store.name,
      store.address || '',
      Number(store.latitude || 0),
      Number(store.longitude || 0)
    ));
  }

  async findAll(): Promise<Store[]> {
    const result = await db.select({
      store: stores,
      merchantUid: merchants.uid
    })
    .from(stores)
    .innerJoin(merchants, eq(stores.merchantId, merchants.id));

    return result.map(({ store, merchantUid }) => new Store(
      store.uid,
      merchantUid,
      store.name,
      store.address || '',
      Number(store.latitude || 0),
      Number(store.longitude || 0)
    ));
  }

  async save(store: Store): Promise<void> {
    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.uid, store.merchantId)
    });

    if (!merchant) throw new Error('Merchant not found');

    await db.insert(stores).values({
      uid: store.id,
      merchantId: merchant.id,
      name: store.name,
      address: store.address,
      latitude: store.latitude.toString(),
      longitude: store.longitude.toString()
    }).onConflictDoUpdate({
      target: stores.uid,
      set: {
        name: store.name,
        address: store.address,
        latitude: store.latitude.toString(),
        longitude: store.longitude.toString()
      }
    });
  }
}
