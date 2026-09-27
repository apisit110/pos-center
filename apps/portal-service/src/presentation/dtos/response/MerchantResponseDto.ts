import { Merchant } from '../../../domain/entities/Merchant';

export interface MerchantResponseDto {
  uid: string;
  mid: string;
  name: string;
}

export function toMerchantResponseDto(merchant: Merchant): MerchantResponseDto {
  return {
    uid: merchant.uid,
    mid: merchant.mid,
    name: merchant.name,
  };
}
