import { Product } from '../../domain/entities/Product';

export interface IProductRepository {
  saveMany(products: Product[]): Promise<void>;
  findByVersion(merchantUid: string, storeUid: string, version: number): Promise<Product[]>;
}
