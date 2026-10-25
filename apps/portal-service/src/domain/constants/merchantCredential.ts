export const MERCHANT_CREDENTIAL_PROVIDERS = ['POS_CASHIER'] as const;
export type MerchantCredentialProvider = typeof MERCHANT_CREDENTIAL_PROVIDERS[number];
export const DEFAULT_MERCHANT_CREDENTIAL_PROVIDER: MerchantCredentialProvider = 'POS_CASHIER';
