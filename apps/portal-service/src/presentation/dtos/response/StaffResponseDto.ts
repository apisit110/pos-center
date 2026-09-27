import { Staff, StaffRole, StaffStatus } from '../../../domain/entities/Staff';

export interface StaffResponseDto {
  id: string;
  merchantId: string;
  name: string;
  role: StaffRole;
  username?: string;
  status: StaffStatus;
  createdAt?: Date;
  merchantName?: string;
}

export function toStaffResponseDto(staff: Staff): StaffResponseDto {
  return {
    id: staff.id,
    merchantId: staff.merchantId,
    name: staff.name,
    role: staff.role,
    username: staff.username,
    status: staff.status,
    createdAt: staff.createdAt,
    merchantName: staff.merchantName,
  };
}
