import { z } from 'zod';
import { DEFAULT_MERCHANT_CREDENTIAL_PROVIDER, MERCHANT_CREDENTIAL_PROVIDERS } from '../../../domain/constants/merchantCredential';

/** body of create and rotate merchant credential */
export const merchantCredentialBodySchema = z.object({
  provider: z.enum(MERCHANT_CREDENTIAL_PROVIDERS).default(DEFAULT_MERCHANT_CREDENTIAL_PROVIDER),
});

export type MerchantCredentialBodyDto = z.infer<typeof merchantCredentialBodySchema>;
