import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
import { TransactionDetail } from '../../domain/entities/Transaction';
import { Actor, findOwnMerchantUid, isProductOwner } from '../auth/Actor';
import { ServiceError } from '../errors/ServiceError';

export class GetTransactionDetailUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private staffRepository: IStaffRepository,
    private merchantRepository: IMerchantRepository,
  ) {}

  async execute(actor: Actor, uid: string): Promise<TransactionDetail> {
    const detail = await this.transactionRepository.getByUid(uid);
    if (!detail) throw ServiceError.ErrTransactionNotFound();

    if (!isProductOwner(actor)) {
      const ownMerchantUid = await findOwnMerchantUid(this.staffRepository, actor);
      const merchant = ownMerchantUid ? await this.merchantRepository.getById(ownMerchantUid) : null;
      // transactions.merchant_id holds the merchant id (mid), as sent by the pos
      if (!merchant || merchant.mid !== detail.merchantMid) throw ServiceError.ErrForbidden();
    }
    return detail;
  }
}
