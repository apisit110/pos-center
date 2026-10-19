import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { Actor, findOwnMerchantUid, isProductOwner } from '../auth/Actor';

export class GetProductFilterMetadataUseCase {
  constructor(
    private productRepository: IProductRepository,
    private staffRepository: IStaffRepository,
  ) {}

  async execute(actor: Actor): Promise<{ brands: string[], units: string[] }> {
    if (isProductOwner(actor)) return this.productRepository.getMetadata();

    const ownMerchantUid = await findOwnMerchantUid(this.staffRepository, actor);
    if (!ownMerchantUid) return { brands: [], units: [] };
    return this.productRepository.getMetadata(ownMerchantUid);
  }
}
