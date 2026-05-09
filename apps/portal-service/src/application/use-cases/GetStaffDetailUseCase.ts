import { IStaffRepository } from '../repositories/IStaffRepository';
import { Staff } from '../../domain/entities/Staff';

export class GetStaffDetailUseCase {
  constructor(private staffRepository: IStaffRepository) {}

  async execute(id: string): Promise<Staff | null> {
    return this.staffRepository.getStaffById(id);
  }
}
