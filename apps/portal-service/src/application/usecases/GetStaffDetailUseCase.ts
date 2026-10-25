import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { ICashierStaffRepository } from '../../domain/repositories/ICashierStaffRepository';
import { Staff } from '../../domain/entities/Staff';
import { Actor, assertMerchantAccess } from '../auth/Actor';
import { ServiceError } from '../errors/ServiceError';

/** Gets a cashier staff (a staff of a merchant). */
export class GetStaffDetailUseCase {
  constructor(
    private cashierStaffRepository: ICashierStaffRepository,
    private staffRepository: IStaffRepository,
  ) {}

  async execute(actor: Actor, uid: string): Promise<Staff> {
    const staff = await this.cashierStaffRepository.getStaffByUid(uid);
    if (!staff) throw ServiceError.ErrStaffNotFound();

    await assertMerchantAccess(this.staffRepository, actor, staff.merchantId);
    return staff;
  }
}
