import { ITerminalRepository } from '../../domain/repositories/ITerminalRepository';
import { IStoreRepository } from '../../domain/repositories/IStoreRepository';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { Terminal } from '../../domain/entities/Terminal';
import { Actor, assertMerchantAccess } from '../auth/Actor';

export class GetTerminalsByStoreUseCase {
  constructor(
    private terminalRepository: ITerminalRepository,
    private storeRepository: IStoreRepository,
    private staffRepository: IStaffRepository,
  ) {}

  async execute(actor: Actor, storeUid: string): Promise<Terminal[]> {
    const store = await this.storeRepository.getById(storeUid);
    if (!store) return [];

    await assertMerchantAccess(this.staffRepository, actor, store.merchantId);
    return this.terminalRepository.findByStoreId(storeUid);
  }
}
