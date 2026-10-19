import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { Staff } from '../../domain/entities/Staff';
import { Actor, assertMerchantAccess } from '../auth/Actor';
import { ServiceError } from '../errors/ServiceError';

export class GetStaffDetailUseCase {
  constructor(private staffRepository: IStaffRepository) {}

  async execute(actor: Actor, uid: string): Promise<Staff> {
    const staff = await this.staffRepository.getStaffByUid(uid);
    if (!staff) throw ServiceError.ErrStaffNotFound();

    await assertMerchantAccess(this.staffRepository, actor, staff.merchantId);
    return staff;
  }
}
