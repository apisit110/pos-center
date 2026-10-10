import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { Staff } from '../../domain/entities/Staff';
import { ServiceError } from '../errors/ServiceError';

export class GetProfileUseCase {
  constructor(private staffRepository: IStaffRepository) {}

  async execute(uid: string): Promise<Staff> {
    const staff = await this.staffRepository.getStaffByUid(uid);
    if (!staff) throw ServiceError.ErrStaffNotFound();
    return staff;
  }
}
