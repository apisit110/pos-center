import { IPOSProductGateway } from '../repositories/IPOSProductGateway';
import { IProductRepository } from '../repositories/IProductRepository';

export class SyncPOSProductsUseCase {
  constructor(
    private readonly posGateway: IPOSProductGateway,
    private readonly productRepository: IProductRepository
  ) {}

  async execute(merchantId: string, storeId: string): Promise<{ success: boolean; count: number }> {
    try {
      // 1. Fetch products from external POS
      const products = await this.posGateway.fetchProducts(merchantId, storeId);

      // 2. Save products to our system
      await this.productRepository.saveMany(products);

      return {
        success: true,
        count: products.length,
      };
    } catch (error) {
      console.error('[SyncPOSProductsUseCase] Error:', error);
      return {
        success: false,
        count: 0,
      };
    }
  }
}
