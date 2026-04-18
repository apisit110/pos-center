import { StoreProduct } from '../../domain/entities/StoreProduct';

export interface StoreProductRepository {
  getProductsByStore(storeId: string): Promise<StoreProduct[]>;
  updateStock(storeProductId: string, newStock: number): Promise<void>;
  updatePrice(storeProductId: string, newPrice: number): Promise<void>;
}
