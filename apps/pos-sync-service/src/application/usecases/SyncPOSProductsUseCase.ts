import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { SyncPOSProductsRequest, SyncPOSProductsResponse } from '../dtos/SyncPOSProductsDto';

export class SyncPOSProductsUseCase {
  constructor(
    private readonly productRepository: IProductRepository
  ) {}

  async execute({ mid, sid, syncVersion }: SyncPOSProductsRequest): Promise<SyncPOSProductsResponse> {
    try {
      // Query products with version > syncVersion
      const products = await this.productRepository.findByVersion(mid, sid, syncVersion);

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
