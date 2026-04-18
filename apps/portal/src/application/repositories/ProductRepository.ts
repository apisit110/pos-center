import { Product } from '../../domain/entities/Product';

export interface ProductFilter {
  barcode?: string;
  name?: string;
  brands?: string[];
  price?: number;
  units?: string[];
}

export interface ProductRepository {
  getProducts(page: number, limit: number, filters?: ProductFilter): Promise<{ products: Product[], total: number }>;
  getProductById(id: string): Promise<Product | null>;
  getFilterMetadata(): Promise<{ brands: string[], units: string[] }>;
}
