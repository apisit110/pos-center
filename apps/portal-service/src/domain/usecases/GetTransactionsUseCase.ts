import { ITransactionRepository, TransactionFilter } from '../repositories/ITransactionRepository';
import { Transaction } from '../entities/Transaction';

export class GetTransactionsUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(page: number, limit: number, filters?: TransactionFilter): Promise<{ transactions: Transaction[]; total: number }> {
    return this.transactionRepository.getTransactions(page, limit, filters);
  }
}
