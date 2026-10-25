import { ICashierProfileRepository } from '../../domain/repositories/ICashierProfileRepository';
import { ISyncTokenService, IssuedSyncToken } from '../../domain/services/ISyncTokenService';
import { SyncError } from '../errors/SyncError';
import { AuthenticateMerchantCredentialUseCase, MerchantCredentialInput } from './AuthenticateMerchantCredentialUseCase';

/** Exchanges the merchant credential for a short lived token of one terminal of the merchant. */
export class IssueSyncTokenUseCase {
  constructor(
    private readonly authenticateMerchantCredentialUseCase: AuthenticateMerchantCredentialUseCase,
    private readonly cashierProfileRepository: ICashierProfileRepository,
    private readonly syncTokenService: ISyncTokenService
  ) {}

  async execute(credential: MerchantCredentialInput, tid: string): Promise<IssuedSyncToken> {
    const merchant = await this.authenticateMerchantCredentialUseCase.execute(credential);

    const terminalWithStore = await this.cashierProfileRepository.findTerminalWithStore(tid);
    if (!terminalWithStore || terminalWithStore.store.merchantId !== merchant.id) {
      throw SyncError.terminalNotFound();
    }

    return this.syncTokenService.sign({
      partnerId: merchant.partnerId,
      sid: terminalWithStore.store.sid,
      tid: terminalWithStore.terminal.tid,
    });
  }
}
