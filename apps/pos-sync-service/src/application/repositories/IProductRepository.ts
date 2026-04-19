import { Product } from '../../domain/entities/Product';

export interface IProductRepository {
  saveMany(products: Product[]): Promise<void>;
  findByVersion(merchantId: string, storeId: string, version: number): Promise<Product[]>;
}
