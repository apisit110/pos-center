import { Staff } from '../../domain/entities/Staff';
import { IStaffRepository } from '../repositories/IStaffRepository';

export class GetStaffByMerchantUseCase {
  constructor(private staffRepository: IStaffRepository) {}

  async execute(merchantUid: string): Promise<Staff[]> {
    return this.staffRepository.getStaffByMerchant(merchantUid);
  }
}
