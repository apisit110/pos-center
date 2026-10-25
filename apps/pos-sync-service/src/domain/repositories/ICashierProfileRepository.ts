import {
  CashierProfileStaff,
  CashierProfileStore,
  CashierProfileTerminal,
} from '../entities/CashierProfile';
import { Merchant } from '../entities/Merchant';

export interface TerminalWithStoreDTO {
  terminal: CashierProfileTerminal;
  store: CashierProfileStore;
}

export interface ICashierProfileRepository {
  findMerchantByPartnerId(partnerId: string): Promise<Merchant | null>;
  findTerminalWithStore(tid: string): Promise<TerminalWithStoreDTO | null>;
  findStaffsByMerchantId(merchantId: number): Promise<CashierProfileStaff[]>;
}
