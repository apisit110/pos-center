import { Staff, StaffRole } from '../entities/Staff';
import { IStaffRepository } from '../repositories/IStaffRepository';
import { v4 as uuidv4 } from 'uuid';

export interface CreateStaffRequest {
  merchantId: string;
  name: string;
  role: StaffRole;
}

export class CreateStaffUseCase {
  constructor(private readonly staffRepository: IStaffRepository) {}

  public async execute(request: CreateStaffRequest): Promise<Staff> {
    const id = uuidv4();
    
    const staff = new Staff(
      id,
      request.merchantId,
      request.name,
      request.role
    );
    
    await this.staffRepository.save(staff);
    
    return staff;
  }
}
