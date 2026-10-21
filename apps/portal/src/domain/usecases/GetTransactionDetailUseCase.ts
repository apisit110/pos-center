import { TransactionRepository } from '../repositories/TransactionRepository';
import { TransactionDetail } from '../entities/Transaction';

export class GetTransactionDetailUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(id: string): Promise<TransactionDetail> {
    return this.transactionRepository.getTransactionById(id);
  }
}
