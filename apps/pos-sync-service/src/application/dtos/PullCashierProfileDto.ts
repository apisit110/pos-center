import { CashierProfile } from '../../domain/entities/CashierProfile';

/** terminal of the sync token */
export interface PullCashierProfileRequest {
  /** merchant `partner_id` */
  partnerId: string;
  /** terminal `tid` */
  tid: string;
}

export interface PullCashierProfileResponse {
  profile: CashierProfile;
  /** version of `profile`, the client compares it with `profileVersion` of pull state */
  profileVersion: string;
}
