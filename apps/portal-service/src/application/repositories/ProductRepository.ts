import { Product } from '../../domain/entities/Product';

export interface ProductRepository {
  getById(id: string): Promise<Product | null>;
  getByMerchantId(merchantId: string): Promise<Product[]>;
  findAll(): Promise<Product[]>;
  save(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
}
