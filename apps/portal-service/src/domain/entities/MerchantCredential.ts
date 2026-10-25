/** Credential of a merchant for a provider. The client secret is never part of it (only its hash is stored). */
export class MerchantCredential {
  constructor(
    public readonly provider: string,
    public readonly clientId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
