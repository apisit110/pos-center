import { IProductRepository } from '../repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';

export class SyncPOSProductsUseCase {
  constructor(
    private readonly productRepository: IProductRepository
  ) {}

  async execute(merchantUid: string, storeUid: string, lastSyncVersion: number = 0): Promise<{ success: boolean; products: Product[] }> {
    try {
      // Query products with version > lastSyncVersion
      const products = await this.productRepository.findByVersion(merchantUid, storeUid, lastSyncVersion);

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
