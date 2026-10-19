import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { Product } from '../../domain/entities/Product';
import { Actor, assertMerchantAccess } from '../auth/Actor';
import { ServiceError } from '../errors/ServiceError';

export class GetProductDetailUseCase {
  constructor(
    private productRepository: IProductRepository,
    private staffRepository: IStaffRepository,
  ) {}

  async execute(actor: Actor, uid: string): Promise<Product> {
    const product = await this.productRepository.getById(uid);
    if (!product) throw ServiceError.ErrProductNotFound();

    await assertMerchantAccess(this.staffRepository, actor, product.merchantId);
    return product;
  }
}
