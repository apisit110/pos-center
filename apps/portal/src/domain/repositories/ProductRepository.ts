import { Product } from '../../domain/entities/Product';

export interface ProductFilter {
  barcode?: string;
  name?: string;
  brands?: string[];
  price?: number;
  units?: string[];
  merchantId?: string;
  storeId?: string;
}

export interface CreateProductRequest {
  uid?: string;
  merchantId: string;
  name: string;
  barcode: string;
  basePrice: number;
  imageUrl: string[];
  brand: string;
  unitName: string;
}

export interface ProductRepository {
  getProducts(page: number, limit: number, filters?: ProductFilter): Promise<{ products: Product[], total: number }>;
  getProductById(id: string): Promise<Product | null>;
  getFilterMetadata(): Promise<{ brands: string[], units: string[] }>;
  createProduct(request: CreateProductRequest): Promise<Product>;
  createProducts(requests: CreateProductRequest[], onProgress?: (done: number, total: number) => void): Promise<{ created: number; errors: string[] }>;
}
