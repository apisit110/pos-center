import { Staff, StaffStatus } from '../../../domain/entities/Staff';

/** staff in a list / detail, `merchant_uid` is the uid of the merchant of the staff */
export interface StaffResponseDto {
  uid: string;
  merchant_uid: string;
  merchant_name_en: string;
  merchant_name_th: string;
  full_name: string;
  role: string;
  username: string;
  status: StaffStatus;
  created_at: string;
}

export function toStaffResponseDto(staff: Staff): StaffResponseDto {
  return {
    uid: staff.id,
    merchant_uid: staff.merchantId,
    merchant_name_en: staff.merchantNameEn ?? '',
    merchant_name_th: staff.merchantNameTh ?? '',
    full_name: staff.name,
    role: staff.role,
    username: staff.username ?? '',
    status: staff.status,
    created_at: staff.createdAt ? staff.createdAt.toISOString() : '',
  };
}

/** staff of a merchant (merchant detail page) */
export interface MerchantStaffResponseDto {
  uid: string;
  full_name: string;
  role: string;
  username: string;
  status: StaffStatus;
}

export function toMerchantStaffResponseDto(staff: Staff): MerchantStaffResponseDto {
  return {
    uid: staff.id,
    full_name: staff.name,
    role: staff.role,
    username: staff.username ?? '',
    status: staff.status,
  };
}
