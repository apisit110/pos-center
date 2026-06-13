import { StaffRepository, StaffFilter } from '../repositories/StaffRepository';
import { Staff } from '../entities/Staff';

export class GetStaffUseCase {
  constructor(private staffRepository: StaffRepository) {}

  async execute(page: number, limit: number, filters?: StaffFilter): Promise<{ staff: Staff[], total: number }> {
    return this.staffRepository.getAllStaff(page, limit, filters);
  }
}
