import { NameLanguage, pickName } from './LocalizedName';

/** Credential of a merchant for a provider. The client secret is never returned by the API. */
export interface MerchantCredential {
  provider: string;
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const MERCHANT_CREDENTIAL_PROVIDERS = ['POS_CASHIER'] as const;
export type MerchantCredentialProvider = typeof MERCHANT_CREDENTIAL_PROVIDERS[number];

/** Result of create / rotate credential: the only time the plain client secret is available. */
export interface IssuedMerchantCredential {
  provider: string;
  clientId: string;
  clientSecret: string;
}

export class Merchant {
  constructor(
    public readonly uid: string,
    public readonly partnerId: string,
    public nameEn: string,
    public nameTh: string,
    /** only filled by the merchant detail api */
    public credentials: MerchantCredential[] = []
  ) {}

  public displayName(language: NameLanguage): string {
    return pickName(language, this.nameEn, this.nameTh);
  }
}
