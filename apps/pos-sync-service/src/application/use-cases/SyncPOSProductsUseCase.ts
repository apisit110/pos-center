import { IProductRepository } from '../repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';

export class SyncPOSProductsUseCase {
  constructor(
    private readonly productRepository: IProductRepository
  ) {}

  async execute(merchantId: string, storeId: string, lastSyncVersion: number = 0): Promise<{ success: boolean; products: Product[] }> {
    try {
      // Query products with version > lastSyncVersion
      const products = await this.productRepository.findByVersion(merchantId, storeId, lastSyncVersion);

      return {
        success: true,
        products: products,
      };
    } catch (error) {
      console.error('[SyncPOSProductsUseCase] Error:', error);
      return {
        success: false,
        products: [],
      };
    }
  }
}
