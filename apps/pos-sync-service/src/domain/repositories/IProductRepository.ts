import { Product } from '../../domain/entities/Product';

export interface ProductFromClient {
  id: string;
  barcode: string;
  name: string;
  basePrice: number;
  imageUrl?: string | null;
  unitName?: string | null;
  brand?: string | null;
}

export interface ProductFromClientResult {
  id: string;
  status: 'synced' | 'already_synced' | 'error';
  error?: string;
}

export interface IProductRepository {
  saveMany(products: Product[]): Promise<void>;
  findByVersion(partnerId: string, sid: string, version: number): Promise<Product[]>;
  receiveProductsFromClient(partnerId: string, sid: string, products: ProductFromClient[]): Promise<ProductFromClientResult[]>;
}
