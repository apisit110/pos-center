import { Product } from '../../domain/entities/Product';

export interface ProductFromClientDTO {
  id: string;
  barcode: string;
  name: string;
  basePrice: number;
  imageUrl?: string | null;
  unitName?: string | null;
  brand?: string | null;
}

export interface ProductFromClientResultDTO {
  id: string;
  status: 'synced' | 'already_synced' | 'error';
  error?: string;
}

export interface IProductRepository {
  saveMany(products: Product[]): Promise<void>;
  findByVersion(mid: string, sid: string, version: number): Promise<Product[]>;
  receiveProductsFromClient(mid: string, sid: string, products: ProductFromClientDTO[]): Promise<ProductFromClientResultDTO[]>;
}
