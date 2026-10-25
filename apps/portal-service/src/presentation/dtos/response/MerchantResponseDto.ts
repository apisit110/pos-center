import { Merchant } from '../../../domain/entities/Merchant';
import { CreateMerchantResult } from '../../../application/usecases/CreateMerchantUseCase';
import { MerchantDetail } from '../../../application/usecases/GetMerchantDetailUseCase';
import { IssuedMerchantCredential } from '../../../application/usecases/CreateMerchantCredentialUseCase';

export interface MerchantResponseDto {
  uid: string;
  partner_id: string;
  name_en: string;
  name_th: string;
}

export function toMerchantResponseDto(merchant: Merchant): MerchantResponseDto {
  return {
    uid: merchant.uid,
    partner_id: merchant.partnerId,
    name_en: merchant.nameEn,
    name_th: merchant.nameTh,
  };
}

export interface MerchantDetailResponseDto extends MerchantResponseDto {
  credentials: { provider: string; client_id: string; created_at: string; updated_at: string }[];
}

export function toMerchantDetailResponseDto(detail: MerchantDetail): MerchantDetailResponseDto {
  return {
    ...toMerchantResponseDto(detail.merchant),
    credentials: detail.credentials.map((credential) => ({
      provider: credential.provider,
      client_id: credential.clientId,
      created_at: credential.createdAt.toISOString(),
      updated_at: credential.updatedAt.toISOString(),
    })),
  };
}

interface IssuedMerchantCredentialResponseDto {
  merchant_uid: string;
  provider: string;
  client_id: string;
  /** plain secret, only in the create and rotate response */
  client_secret: string;
}

export function toCreateMerchantCredentialResponseDto(issued: IssuedMerchantCredential): IssuedMerchantCredentialResponseDto & { created_at: string } {
  return {
    merchant_uid: issued.merchantUid,
    provider: issued.credential.provider,
    client_id: issued.credential.clientId,
    client_secret: issued.clientSecret,
    created_at: issued.credential.createdAt.toISOString(),
  };
}

export function toRotateMerchantCredentialResponseDto(issued: IssuedMerchantCredential): IssuedMerchantCredentialResponseDto & { updated_at: string } {
  return {
    merchant_uid: issued.merchantUid,
    provider: issued.credential.provider,
    client_id: issued.credential.clientId,
    client_secret: issued.clientSecret,
    updated_at: issued.credential.updatedAt.toISOString(),
  };
}

export interface CreateMerchantResponseDto extends MerchantResponseDto {
  cashier_staff: { uid: string; username: string; full_name: string; role: string }[];
  stores: {
    uid: string;
    sid: string;
    name_en: string;
    name_th: string;
    terminals: { uid: string; tid: string; name_en: string; name_th: string }[];
  }[];
}

export function toCreateMerchantResponseDto(result: CreateMerchantResult): CreateMerchantResponseDto {
  return {
    ...toMerchantResponseDto(result.merchant),
    cashier_staff: result.cashierStaff.map((staff) => ({
      uid: staff.id,
      username: staff.username ?? '',
      full_name: staff.name,
      role: staff.role,
    })),
    stores: result.stores.map(({ store, terminals }) => ({
      uid: store.uid,
      sid: store.sid,
      name_en: store.nameEn,
      name_th: store.nameTh,
      terminals: terminals.map((terminal) => ({
        uid: terminal.id,
        tid: terminal.tid,
        name_en: terminal.nameEn,
        name_th: terminal.nameTh,
      })),
    })),
  };
}
