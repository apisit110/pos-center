import { randomUUID } from 'crypto';
import { merchantUidIs } from '../utils/merchant';
import {
  db, merchants, merchantCredentials, stores as storesTable, terminals as terminalsTable, mapStoreTerminal, addresses, mapStoreAddress,
  cashierStaff, cashierStaffRole, pins, eq, and, or, ilike, inArray, count, asc,
} from '@pos-center/database';
import { MerchantCredentialProvider } from '../../domain/constants/merchantCredential';
import { CASHIER_APP_ID } from '../../domain/constants/app';
import { ResolvedAddress } from '../../domain/repositories/IAddressRepository';
import { CreateCredentialResult, IMerchantRepository, MerchantFilter, NewCashierStaff, NewStore } from '../../domain/repositories/IMerchantRepository';
import { Merchant } from '../../domain/entities/Merchant';
import { MerchantCredential } from '../../domain/entities/MerchantCredential';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const UNIQUE_VIOLATION = '23505';
const MERCHANT_PROVIDER_UNIQUE = 'merchant_credential_merchant_provider_unique';

const toMerchant = (row: typeof merchants.$inferSelect): Merchant =>
  new Merchant(row.uid, row.partnerId, row.nameEn, row.nameTh);

/** never select client_secret */
const credentialColumns = {
  provider: merchantCredentials.provider,
  clientId: merchantCredentials.clientId,
  createdAt: merchantCredentials.createdAt,
  updatedAt: merchantCredentials.updatedAt,
};

const toMerchantCredential = (row: { provider: string; clientId: string; createdAt: Date; updatedAt: Date }): MerchantCredential =>
  new MerchantCredential(row.provider, row.clientId, row.createdAt, row.updatedAt);

async function insertAddress(tx: Tx, address: ResolvedAddress): Promise<number> {
  const [inserted] = await tx.insert(addresses).values({
    provinceId: address.provinceId,
    districtId: address.districtId,
    subDistrictId: address.subDistrictId,
    postalCodeId: address.postalCodeId,
    address1: address.address1,
    latitude: address.latitude?.toString() ?? null,
    longitude: address.longitude?.toString() ?? null,
  }).returning({ id: addresses.id });
  return inserted.id;
}

export class DrizzleMerchantRepository implements IMerchantRepository {
  async getById(uid: string): Promise<Merchant | null> {
    const result = await db.query.merchants.findFirst({
      where: merchantUidIs(uid),
    });

    if (!result) return null;

    return toMerchant(result);
  }

  async getByPartnerId(partnerId: string): Promise<Merchant | null> {
    const result = await db.query.merchants.findFirst({
      where: eq(merchants.partnerId, partnerId),
    });

    if (!result) return null;

    return toMerchant(result);
  }

  async getCredentials(merchantUid: string): Promise<MerchantCredential[]> {
    const results = await db.select(credentialColumns).from(merchantCredentials)
      .innerJoin(merchants, eq(merchantCredentials.merchantId, merchants.id))
      .where(merchantUidIs(merchantUid))
      .orderBy(asc(merchantCredentials.provider));

    return results.map(toMerchantCredential);
  }

  async getCredential(merchantUid: string, provider: MerchantCredentialProvider): Promise<MerchantCredential | null> {
    const [row] = await db.select(credentialColumns).from(merchantCredentials)
      .innerJoin(merchants, eq(merchantCredentials.merchantId, merchants.id))
      .where(and(merchantUidIs(merchantUid), eq(merchantCredentials.provider, provider)))
      .limit(1);

    return row ? toMerchantCredential(row) : null;
  }

  async createCredential(merchantUid: string, provider: MerchantCredentialProvider, clientId: string, clientSecretHash: string): Promise<CreateCredentialResult> {
    const [merchant] = await db.select({ id: merchants.id }).from(merchants).where(merchantUidIs(merchantUid)).limit(1);
    if (!merchant) throw new Error(`Merchant ${merchantUid} not found`);

    try {
      const [row] = await db.insert(merchantCredentials).values({
        merchantId: merchant.id,
        provider,
        clientId,
        clientSecret: clientSecretHash,
      }).returning(credentialColumns);
      return { status: 'created', credential: toMerchantCredential(row) };
    } catch (error) {
      const { code, constraint_name } = error as { code?: string; constraint_name?: string };
      if (code === UNIQUE_VIOLATION) {
        return constraint_name === MERCHANT_PROVIDER_UNIQUE ? { status: 'provider_exists' } : { status: 'client_id_taken' };
      }
      throw error;
    }
  }

  async updateCredentialSecret(merchantUid: string, provider: MerchantCredentialProvider, clientSecretHash: string): Promise<MerchantCredential | null> {
    const [row] = await db.update(merchantCredentials)
      .set({ clientSecret: clientSecretHash, updatedAt: new Date() })
      .where(and(
        eq(merchantCredentials.provider, provider),
        inArray(merchantCredentials.merchantId, db.select({ id: merchants.id }).from(merchants).where(merchantUidIs(merchantUid))),
      ))
      .returning(credentialColumns);

    return row ? toMerchantCredential(row) : null;
  }

  async findAll(page: number, limit: number, filters?: MerchantFilter): Promise<{ merchants: Merchant[]; total: number }> {
    const offset = (page - 1) * limit;
    const conditions: any[] = [];

    if (filters?.partnerId) {
      conditions.push(ilike(merchants.partnerId, `%${filters.partnerId}%`));
    }
    if (filters?.name) {
      conditions.push(or(ilike(merchants.nameEn, `%${filters.name}%`), ilike(merchants.nameTh, `%${filters.name}%`)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db.select().from(merchants)
      .where(whereClause)
      .orderBy(asc(merchants.id))
      .limit(limit)
      .offset(offset);

    const totalCount = await db.select({ value: count() }).from(merchants).where(whereClause);

    return {
      merchants: results.map(toMerchant),
      total: Number(totalCount[0].value),
    };
  }

  async createWithMembers(merchant: Merchant, newCashierStaff: NewCashierStaff[], newStores: NewStore[]): Promise<void> {
    await db.transaction(async (tx) => {
      const [insertedMerchant] = await tx.insert(merchants).values({
        uid: merchant.uid,
        partnerId: merchant.partnerId,
        nameEn: merchant.nameEn,
        nameTh: merchant.nameTh,
      }).returning({ id: merchants.id });

      for (const { staff: member, roleId } of newCashierStaff) {
        const [insertedStaff] = await tx.insert(cashierStaff).values({
          merchantId: insertedMerchant.id,
          uid: member.id,
          username: member.username,
          fullName: member.name,
          status: member.status,
          syncStatus: 'PENDING',
        }).returning({ id: cashierStaff.id });

        await tx.insert(cashierStaffRole).values({ staffId: insertedStaff.id, roleId });

        if (member.pinHash && member.username) {
          await tx.insert(pins).values({ uuid: randomUUID(), appId: CASHIER_APP_ID, username: member.username, pinHash: member.pinHash });
        }
      }

      for (const { store, registeredAddress, contractAddress, terminals } of newStores) {
        const [insertedStore] = await tx.insert(storesTable).values({
          merchantId: insertedMerchant.id,
          uid: store.uid,
          sid: store.sid,
          nameEn: store.nameEn,
          nameTh: store.nameTh,
        }).returning({ id: storesTable.id });

        const registeredAddressId = await insertAddress(tx, registeredAddress);
        const contractAddressId = await insertAddress(tx, contractAddress);
        await tx.insert(mapStoreAddress).values([
          { storeId: insertedStore.id, addressId: registeredAddressId, type: 'REGISTERED' },
          { storeId: insertedStore.id, addressId: contractAddressId, type: 'CONTRACT' },
        ]);

        for (const terminal of terminals) {
          const [insertedTerminal] = await tx.insert(terminalsTable).values({
            uid: terminal.id,
            tid: terminal.tid,
            nameEn: terminal.nameEn,
            nameTh: terminal.nameTh,
          }).returning({ id: terminalsTable.id });

          await tx.insert(mapStoreTerminal).values({ storeId: insertedStore.id, terminalId: insertedTerminal.id });
        }
      }
    });
  }
}
