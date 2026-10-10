import { Staff } from '../../../domain/entities/Staff';

export interface UserResponseDto {
  uid: string;
  name: string;
  merchant_id: string;
}

export interface LoginResponseDto {
  token: string;
  user: UserResponseDto;
}

export interface ProfileResponseDto {
  user: UserResponseDto;
}

export const toUserResponseDto = (user: { uid: string; name: string; merchantId: string }): UserResponseDto => ({
  uid: user.uid,
  name: user.name,
  merchant_id: user.merchantId,
});

export const toProfileResponseDto = (staff: Staff): ProfileResponseDto => ({
  user: toUserResponseDto({ uid: staff.id, name: staff.name, merchantId: staff.merchantId }),
});
