import { Staff } from '../entities/Staff';
import { StaffRepository } from '../repositories/StaffRepository';

export class GetStaffByMerchantUseCase {
  constructor(private staffRepository: StaffRepository) {}

  async execute(merchantId: string): Promise<Staff[]> {
    return this.staffRepository.getStaffByMerchant(merchantId);
  }
}
