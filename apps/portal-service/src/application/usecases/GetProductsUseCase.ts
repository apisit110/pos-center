import { IProductRepository, ProductFilter } from '../../domain/repositories/IProductRepository';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { Product } from '../../domain/entities/Product';
import { Actor, findOwnMerchantUid, isProductOwner } from '../auth/Actor';
import { ServiceError } from '../errors/ServiceError';

export interface GetProductsInput extends ProductFilter {
  page: number;
  limit: number;
}

export interface GetProductsOutput {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export class GetProductsUseCase {
  constructor(
    private productRepository: IProductRepository,
    private staffRepository: IStaffRepository,
  ) {}

  async execute(actor: Actor, input: GetProductsInput): Promise<GetProductsOutput> {
    const { page, limit, ...filters } = input;
    let merchantUid = filters.merchantUid;

    if (!isProductOwner(actor)) {
      const ownMerchantUid = await findOwnMerchantUid(this.staffRepository, actor);
      if (!ownMerchantUid) return { products: [], total: 0, page, limit };
      if (merchantUid && merchantUid !== ownMerchantUid) throw ServiceError.ErrForbidden();
      merchantUid = ownMerchantUid;
    }

    const { products, total } = await this.productRepository.findAll(page, limit, { ...filters, merchantUid });
    return { products, total, page, limit };
  }
}
