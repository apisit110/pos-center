import { ITransactionRepository, TransactionFilter } from '../../domain/repositories/ITransactionRepository';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { Transaction } from '../../domain/entities/Transaction';
import { Actor, findOwnMerchantUid, isProductOwner } from '../auth/Actor';
import { toRangeEnd, toRangeStart } from '../utils/dateRange';

export interface GetTransactionsInput {
  page: number;
  limit: number;
  transactionId?: string;
  orderId?: string;
  method?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetTransactionsOutput {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export class GetTransactionsUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private staffRepository: IStaffRepository,
  ) {}

  async execute(actor: Actor, input: GetTransactionsInput): Promise<GetTransactionsOutput> {
    const { page, limit } = input;

    let merchantUid: string | undefined;
    if (!isProductOwner(actor)) {
      const ownMerchantUid = await findOwnMerchantUid(this.staffRepository, actor);
      if (!ownMerchantUid) return { transactions: [], total: 0, page, limit };
      merchantUid = ownMerchantUid;
    }

    const filters: TransactionFilter = {
      merchantUid,
      transactionId: input.transactionId,
      orderId: input.orderId,
      method: input.method,
      status: input.status,
      startDate: toRangeStart(input.startDate),
      endDate: toRangeEnd(input.endDate),
    };
    const { transactions, total } = await this.transactionRepository.getTransactions(page, limit, filters);
    return { transactions, total, page, limit };
  }
}
