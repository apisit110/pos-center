import { CashierProfile } from '../../../domain/entities/CashierProfile';

export interface PullCashierProfileResponseDto {
  message: string;
  merchant: {
    uid: string;
    partner_id: string;
    name_en: string;
    name_th: string;
  };
  store: {
    uid: string;
    sid: string;
    name_en: string;
    name_th: string;
  };
  terminal: {
    uid: string;
    tid: string;
    name_en: string;
    name_th: string;
  };
  staffs: {
    uid: string;
    username: string;
    full_name: string;
    status: string;
    roles: string[];
    pin_hash: string;
    updated_at: string;
  }[];
}

export const buildPullCashierProfileResponse = ({ merchant, store, terminal, staffs }: CashierProfile): PullCashierProfileResponseDto => ({
  message: 'Sync completed successfully',
  merchant: {
    uid: merchant.uid,
    partner_id: merchant.partnerId,
    name_en: merchant.nameEn,
    name_th: merchant.nameTh,
  },
  store: {
    uid: store.uid,
    sid: store.sid,
    name_en: store.nameEn,
    name_th: store.nameTh,
  },
  terminal: {
    uid: terminal.uid,
    tid: terminal.tid,
    name_en: terminal.nameEn,
    name_th: terminal.nameTh,
  },
  staffs: staffs.map(staff => ({
    uid: staff.uid,
    username: staff.username,
    full_name: staff.fullName,
    status: staff.status,
    roles: staff.roles,
    pin_hash: staff.pinHash,
    updated_at: staff.updatedAt.toISOString(),
  })),
});
