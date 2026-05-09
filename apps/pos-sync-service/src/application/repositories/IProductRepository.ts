import { Product } from '../../domain/entities/Product';

export interface IProductRepository {
  saveMany(products: Product[]): Promise<void>;
  findByVersion(mid: string, sid: string, version: number): Promise<Product[]>;
}
