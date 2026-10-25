import { Product } from '../../domain/entities/Product';

export interface SyncPOSProductsRequest {
  /** merchant `partner_id` */
  mid: string;
  /** store `sid` */
  sid: string;
  /** returns products with version > syncVersion */
  syncVersion: number;
}

export interface SyncPOSProductsResponse {
  success: boolean;
  products: Product[];
}
