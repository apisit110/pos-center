import { IStoreRepository } from '../../domain/repositories/IStoreRepository';
import { IMerchantRepository } from '../../domain/repositories/IMerchantRepository';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { Store } from '../../domain/entities/Store';
import { Actor, findOwnMerchantUid, isProductOwner } from '../auth/Actor';
import { ServiceError } from '../errors/ServiceError';

export class GetStoresUseCase {
  constructor(
    private storeRepository: IStoreRepository,
    private merchantRepository: IMerchantRepository,
    private staffRepository: IStaffRepository,
  ) {}

  async execute(actor: Actor, merchantUid?: string): Promise<Store[]> {
    let scopedMerchantUid = merchantUid;

    if (!isProductOwner(actor)) {
      const ownMerchantUid = await findOwnMerchantUid(this.staffRepository, actor);
      if (!ownMerchantUid) return [];
      if (scopedMerchantUid && scopedMerchantUid !== ownMerchantUid) throw ServiceError.ErrForbidden();
      scopedMerchantUid = ownMerchantUid;
    }

    if (scopedMerchantUid) {
      const merchant = await this.merchantRepository.getById(scopedMerchantUid);
      if (!merchant) throw ServiceError.ErrMerchantNotFound();
      return this.storeRepository.getByMerchantId(scopedMerchantUid);
    }

    return this.storeRepository.findAll();
  }
}
