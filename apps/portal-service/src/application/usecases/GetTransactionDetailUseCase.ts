import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { TransactionDetail } from '../../domain/entities/Transaction';
import { Actor, assertMerchantAccess } from '../auth/Actor';
import { ServiceError } from '../errors/ServiceError';

export class GetTransactionDetailUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private staffRepository: IStaffRepository,
  ) {}

  async execute(actor: Actor, uid: string): Promise<TransactionDetail> {
    const detail = await this.transactionRepository.getByUid(uid);
    if (!detail) throw ServiceError.ErrTransactionNotFound();

    await assertMerchantAccess(this.staffRepository, actor, detail.merchantUid);
    return detail;
  }
}
