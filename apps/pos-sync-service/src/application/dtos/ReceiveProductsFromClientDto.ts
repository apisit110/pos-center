import { ProductFromClient, ProductFromClientResult } from '../../domain/repositories/IProductRepository';

export interface ReceiveProductsFromClientRequest {
  /** merchant `partner_id` */
  mid: string;
  /** store `sid` */
  sid: string;
  products: ProductFromClient[];
}

export interface ReceiveProductsFromClientResponse {
  /** same order as request */
  results: ProductFromClientResult[];
}
