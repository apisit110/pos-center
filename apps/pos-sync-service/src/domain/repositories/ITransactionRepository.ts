import { Transaction } from '../entities/Transaction';

export interface ITransactionRepository {
  save(transaction: Transaction, storeSid: string): Promise<Transaction>;
  findByUid(uid: string): Promise<{ id: string } | null>;
}
