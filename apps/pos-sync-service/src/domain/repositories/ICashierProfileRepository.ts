import {
  CashierProfileStaff,
  CashierProfileStore,
  CashierProfileTerminal,
} from '../entities/CashierProfile';
import { Merchant } from '../entities/Merchant';

export interface TerminalWithStore {
  terminal: CashierProfileTerminal;
  store: CashierProfileStore;
}

export interface ICashierProfileRepository {
  findMerchantByPartnerId(partnerId: string): Promise<Merchant | null>;
  findTerminalWithStore(tid: string): Promise<TerminalWithStore | null>;
  findStaffsByMerchantId(merchantId: number): Promise<CashierProfileStaff[]>;
}
