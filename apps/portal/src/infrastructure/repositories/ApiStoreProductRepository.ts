import { StoreProduct } from '../../domain/entities/StoreProduct';
import {
  BatchStoreProductMappingRequest,
  BatchStoreProductMappingResponse,
  StoreProductRepository
} from '../../application/repositories/StoreProductRepository';
import ApiClient from '../api/ApiClient';

export class ApiStoreProductRepository implements StoreProductRepository {
  public async getProductsByStore(storeId: string): Promise<StoreProduct[]> {
    const response = await ApiClient.get(`/stores/${storeId}/products`);
    const data = response.data;
    return data.map((sp: any) => new StoreProduct(
      sp.id,
      sp.storeId,
      sp.productId,
      sp.stock,
      sp.price
    ));
  }

  public async updateStock(storeProductId: string, newStock: number): Promise<void> {
    await ApiClient.patch(`/store-products/${storeProductId}/stock`, { stock: newStock });
  }

  public async updatePrice(storeProductId: string, newPrice: number): Promise<void> {
    await ApiClient.patch(`/store-products/${storeProductId}/price`, { price: newPrice });
  }

  public async batchUpsertMappings(
    mappings: BatchStoreProductMappingRequest[]
  ): Promise<BatchStoreProductMappingResponse> {
    const response = await ApiClient.post('/store-products/batch', { mappings });
    return response.data;
  }
}
