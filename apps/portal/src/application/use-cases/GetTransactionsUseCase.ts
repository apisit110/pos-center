import { TransactionRepository, TransactionFilter } from '../repositories/TransactionRepository';
import { Transaction } from '../../domain/entities/Transaction';

export class GetTransactionsUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(page: number, limit: number, filters?: TransactionFilter): Promise<{ transactions: Transaction[]; total: number }> {
    return this.transactionRepository.getTransactions(page, limit, filters);
  }
}
