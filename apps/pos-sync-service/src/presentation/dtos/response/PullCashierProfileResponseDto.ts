import { PullCashierProfileResponse } from '../../../application/dtos/PullCashierProfileDto';

export interface PullCashierProfileResponseDto {
  message: string;
  profile_version: string;
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

export const buildPullCashierProfileResponse = ({
  profile: { merchant, store, terminal, staffs },
  profileVersion,
}: PullCashierProfileResponse): PullCashierProfileResponseDto => ({
  message: 'Sync completed successfully',
  profile_version: profileVersion,
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
