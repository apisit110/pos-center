import { Staff } from '../../domain/entities/Staff';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
import { NotFoundError } from '../errors/CommonErrors';

export class GetStaffByMerchantUseCase {
  constructor(
    private staffRepository: IStaffRepository,
    private merchantRepository: IMerchantRepository
  ) {}

  async execute(merchantUid: string): Promise<Staff[]> {
    const merchant = await this.merchantRepository.getById(merchantUid);
    if (!merchant) throw new NotFoundError('Merchant not found');

    return this.staffRepository.getStaffByMerchant(merchantUid);
  }
}
