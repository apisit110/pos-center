import { db, merchants, merchantCredentials, eq, and } from '@pos-center/database';
import { Merchant } from '../../domain/entities/Merchant';
import { IMerchantCredentialRepository, MerchantCredential } from '../../domain/repositories/IMerchantCredentialRepository';

export class DrizzleMerchantCredentialRepository implements IMerchantCredentialRepository {
  async findByClientId(clientId: string): Promise<MerchantCredential | null> {
    const result = await db.select({
      merchant: merchants,
      clientSecretHash: merchantCredentials.clientSecret,
    })
    .from(merchantCredentials)
    .innerJoin(merchants, eq(merchantCredentials.merchantId, merchants.id))
    .where(
      and(
        eq(merchantCredentials.clientId, clientId),
        eq(merchantCredentials.provider, 'POS_CASHIER')
      )
    )
    .limit(1);

    if (!result.length) return null;

    const { merchant, clientSecretHash } = result[0];
    return {
      merchant: new Merchant(merchant.id, merchant.uid, merchant.partnerId, merchant.nameEn, merchant.nameTh),
      clientSecretHash,
    };
  }
}
