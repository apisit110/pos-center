import { Product } from '../../domain/entities/Product';

export interface IProductRepository {
  getById(id: string): Promise<Product | null>;
  getByMerchantId(merchantId: string): Promise<Product[]>;
  findAll(page?: number, limit?: number, filters?: any): Promise<{ products: Product[], total: number }>;
  save(product: Product): Promise<void>;
  bulkSave(products: Product[]): Promise<void>;
  delete(id: string): Promise<void>;
  getMetadata(): Promise<{ brands: string[], units: string[] }>;
}
