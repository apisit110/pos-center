import { ICashierProfileRepository } from '../../domain/repositories/ICashierProfileRepository';
import { ISyncStateRepository } from '../../domain/repositories/ISyncStateRepository';
import { CashierProfile } from '../../domain/entities/CashierProfile';
import { SyncError } from '../errors/SyncError';
import { PullCashierProfileRequest, PullCashierProfileResponse } from '../dtos/PullCashierProfileDto';

export class PullCashierProfileUseCase {
  constructor(
    private readonly cashierProfileRepository: ICashierProfileRepository,
    private readonly syncStateRepository: ISyncStateRepository
  ) {}

  async execute({ partnerId, tid }: PullCashierProfileRequest): Promise<PullCashierProfileResponse> {
    // read the version before the profile: a change in between makes the client pull again, never miss it
    const profileVersion = await this.syncStateRepository.findProfileVersion(partnerId, tid);

    const merchant = await this.cashierProfileRepository.findMerchantByPartnerId(partnerId);
    const terminalWithStore = await this.cashierProfileRepository.findTerminalWithStore(tid);
    // the terminal can be removed or moved to another merchant after the token is issued
    if (!merchant || !terminalWithStore || terminalWithStore.store.merchantId !== merchant.id) {
      throw SyncError.terminalNotFound();
    }

    const staffs = await this.cashierProfileRepository.findStaffsByMerchantId(merchant.id);

    return {
      profile: new CashierProfile(merchant, terminalWithStore.store, terminalWithStore.terminal, staffs),
      profileVersion,
    };
  }
}
