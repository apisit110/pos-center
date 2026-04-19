import { StaffRepository } from '../repositories/StaffRepository';
import { Staff } from '../../domain/entities/Staff';

export class GetStaffDetailUseCase {
  constructor(private staffRepository: StaffRepository) {}

  async execute(id: string): Promise<Staff | null> {
    return this.staffRepository.getStaffById(id);
  }
}
