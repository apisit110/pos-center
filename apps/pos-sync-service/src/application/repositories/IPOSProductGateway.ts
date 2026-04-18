import { Product } from '../../domain/entities/Product';

export interface IPOSProductGateway {
  fetchProducts(merchantId: string): Promise<Product[]>;
}
