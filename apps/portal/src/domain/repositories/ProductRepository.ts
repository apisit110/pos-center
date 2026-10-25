import { Brand, Product } from '../../domain/entities/Product';

export interface ProductFilter {
  barcode?: string;
  name?: string;
  /** brand uids */
  brands?: string[];
  price?: number;
  units?: string[];
  merchantId?: string;
  storeId?: string;
}

export interface CreateProductRequest {
  uid?: string;
  merchantId: string;
  nameEn: string;
  nameTh: string;
  barcode: string;
  basePrice: number;
  imageUrl: string;
  brandUid: string;
  unitName: string;
}

export interface ProductRepository {
  getProducts(page: number, limit: number, filters?: ProductFilter): Promise<{ products: Product[], total: number }>;
  getProductById(id: string): Promise<Product | null>;
  getFilterMetadata(): Promise<{ brands: Brand[], units: string[] }>;
  createProduct(request: CreateProductRequest): Promise<Product>;
  createProducts(requests: CreateProductRequest[], onProgress?: (done: number, total: number) => void): Promise<{ created: number; errors: string[] }>;
}
