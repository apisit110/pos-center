import { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { Merchant } from '../../domain/entities/Merchant';
import { Actor, assertMerchantAccess } from '../auth/Actor';
import { ServiceError } from '../errors/ServiceError';

export class GetMerchantDetailUseCase {
  constructor(
    private merchantRepository: IMerchantRepository,
    private staffRepository: IStaffRepository,
  ) {}

  async execute(actor: Actor, uid: string): Promise<Merchant> {
    await assertMerchantAccess(this.staffRepository, actor, uid);

    const merchant = await this.merchantRepository.getById(uid);
    if (!merchant) throw ServiceError.ErrMerchantNotFound();
    return merchant;
  }
}
