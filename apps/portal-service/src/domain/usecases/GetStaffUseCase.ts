import { IStaffRepository, StaffFilter } from '../repositories/IStaffRepository';
import { Staff } from '../entities/Staff';

export class GetStaffUseCase {
  constructor(private staffRepository: IStaffRepository) {}

  async execute(page: number, limit: number, filters?: StaffFilter): Promise<{ staff: Staff[], total: number }> {
    return this.staffRepository.getStaff(page, limit, filters);
  }
}
