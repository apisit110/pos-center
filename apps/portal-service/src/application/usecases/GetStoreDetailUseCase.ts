import { IStoreRepository } from '../../domain/repositories/IStoreRepository';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { Store } from '../../domain/entities/Store';
import { Actor, assertMerchantAccess } from '../auth/Actor';
import { ServiceError } from '../errors/ServiceError';

export class GetStoreDetailUseCase {
  constructor(
    private storeRepository: IStoreRepository,
    private staffRepository: IStaffRepository,
  ) {}

  async execute(actor: Actor, uid: string): Promise<Store> {
    const store = await this.storeRepository.getById(uid);
    if (!store) throw ServiceError.ErrStoreNotFound();

    await assertMerchantAccess(this.staffRepository, actor, store.merchantId);
    return store;
  }
}
