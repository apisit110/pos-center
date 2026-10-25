import { Staff } from '../../domain/entities/Staff';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { ICashierStaffRepository } from '../../domain/repositories/ICashierStaffRepository';
import { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
import { Actor, assertMerchantAccess } from '../auth/Actor';
import { ServiceError } from '../errors/ServiceError';

/** Lists the cashier staff of a merchant. */
export class GetStaffByMerchantUseCase {
  constructor(
    private cashierStaffRepository: ICashierStaffRepository,
    private staffRepository: IStaffRepository,
    private merchantRepository: IMerchantRepository
  ) {}

  async execute(actor: Actor, merchantUid: string): Promise<Staff[]> {
    await assertMerchantAccess(this.staffRepository, actor, merchantUid);

    const merchant = await this.merchantRepository.getById(merchantUid);
    if (!merchant) throw ServiceError.ErrMerchantNotFound();

    return this.cashierStaffRepository.getStaffByMerchant(merchantUid);
  }
}
