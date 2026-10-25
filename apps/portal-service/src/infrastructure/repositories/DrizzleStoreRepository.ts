import { merchantUidIs } from '../utils/merchant';
import {
  db, stores, merchants, addresses, mapStoreAddress, provinces, districts, subDistricts, postalCodes, eq, inArray, SQL,
} from '@pos-center/database';
import { IStoreRepository } from '../../domain/repositories/IStoreRepository';
import { Store, StoreAddress } from '../../domain/entities/Store';

const MAX_MERCHANT_SCOPED_RESULTS = 500;

const toNumberOrNull = (value: string | null): number | null => (value === null ? null : Number(value));

/** REGISTERED / CONTRACT address of each store, by store id */
async function findAddresses(storeIds: number[]): Promise<Map<number, { registered: StoreAddress | null; contract: StoreAddress | null }>> {
  const result = new Map<number, { registered: StoreAddress | null; contract: StoreAddress | null }>();
  if (storeIds.length === 0) return result;

  const rows = await db.select({
    storeId: mapStoreAddress.storeId,
    type: mapStoreAddress.type,
    address1: addresses.address1,
    latitude: addresses.latitude,
    longitude: addresses.longitude,
    provinceCode: provinces.code,
    provinceNameTh: provinces.nameTh,
    provinceNameEn: provinces.nameEn,
    districtCode: districts.code,
    districtNameTh: districts.nameTh,
    districtNameEn: districts.nameEn,
    subDistrictCode: subDistricts.code,
    subDistrictNameTh: subDistricts.nameTh,
    subDistrictNameEn: subDistricts.nameEn,
    postalCode: postalCodes.code,
  })
    .from(mapStoreAddress)
    .innerJoin(addresses, eq(mapStoreAddress.addressId, addresses.id))
    .innerJoin(provinces, eq(addresses.provinceId, provinces.id))
    .innerJoin(districts, eq(addresses.districtId, districts.id))
    .innerJoin(subDistricts, eq(addresses.subDistrictId, subDistricts.id))
    .innerJoin(postalCodes, eq(addresses.postalCodeId, postalCodes.id))
    .where(inArray(mapStoreAddress.storeId, storeIds));

  for (const row of rows) {
    const entry = result.get(row.storeId) ?? { registered: null, contract: null };
    const address: StoreAddress = {
      address1: row.address1 ?? '',
      province: { code: row.provinceCode ?? '', nameTh: row.provinceNameTh ?? '', nameEn: row.provinceNameEn ?? '' },
      district: { code: row.districtCode ?? '', nameTh: row.districtNameTh ?? '', nameEn: row.districtNameEn ?? '' },
      subDistrict: { code: row.subDistrictCode ?? '', nameTh: row.subDistrictNameTh ?? '', nameEn: row.subDistrictNameEn ?? '' },
      postalCode: row.postalCode ?? '',
      latitude: toNumberOrNull(row.latitude),
      longitude: toNumberOrNull(row.longitude),
    };
    if (row.type === 'REGISTERED') entry.registered = address;
    else entry.contract = address;
    result.set(row.storeId, entry);
  }
  return result;
}

export class DrizzleStoreRepository implements IStoreRepository {
  private async find(condition?: SQL, limit?: number): Promise<Store[]> {
    const query = db.select({
      store: stores,
      merchantUid: merchants.uid,
      partnerId: merchants.partnerId,
    })
      .from(stores)
      .innerJoin(merchants, eq(stores.merchantId, merchants.id))
      .where(condition);
    const rows = limit === undefined ? await query : await query.limit(limit);

    const addressesByStore = await findAddresses(rows.map((r) => r.store.id));
    return rows.map(({ store, merchantUid, partnerId }) => new Store(
      store.uid,
      store.sid,
      merchantUid,
      partnerId,
      store.nameEn,
      store.nameTh,
      addressesByStore.get(store.id)?.registered ?? null,
      addressesByStore.get(store.id)?.contract ?? null,
    ));
  }

  async getById(uid: string): Promise<Store | null> {
    const [store] = await this.find(eq(stores.uid, uid), 1);
    return store ?? null;
  }

  async getByMerchantId(merchantId: string): Promise<Store[]> {
    return this.find(merchantUidIs(merchantId), MAX_MERCHANT_SCOPED_RESULTS);
  }

  async findAll(): Promise<Store[]> {
    return this.find();
  }
}
