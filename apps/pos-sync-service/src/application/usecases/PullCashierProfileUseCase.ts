import { ICashierProfileRepository } from '../../domain/repositories/ICashierProfileRepository';
import { CashierProfile } from '../../domain/entities/CashierProfile';
import { SyncTokenClaims } from '../../domain/services/ISyncTokenService';
import { SyncError } from '../errors/SyncError';

export class PullCashierProfileUseCase {
  constructor(
    private readonly cashierProfileRepository: ICashierProfileRepository
  ) {}

  /** `claims` is the terminal of the sync token */
  async execute({ partnerId, tid }: SyncTokenClaims): Promise<CashierProfile> {
    const merchant = await this.cashierProfileRepository.findMerchantByPartnerId(partnerId);
    const terminalWithStore = await this.cashierProfileRepository.findTerminalWithStore(tid);
    // the terminal can be removed or moved to another merchant after the token is issued
    if (!merchant || !terminalWithStore || terminalWithStore.store.merchantId !== merchant.id) {
      throw SyncError.terminalNotFound();
    }

    const staffs = await this.cashierProfileRepository.findStaffsByMerchantId(merchant.id);

    return new CashierProfile(merchant, terminalWithStore.store, terminalWithStore.terminal, staffs);
  }
}
