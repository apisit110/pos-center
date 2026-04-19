import { Product } from '../../domain/entities/Product';
import { IPOSProductGateway } from '../../application/repositories/IPOSProductGateway';

export class HttpPOSProductGateway implements IPOSProductGateway {
  async fetchProducts(merchantId: string, storeId: string): Promise<Product[]> {
    console.log(`[HttpPOSProductGateway] Fetching products for merchant: ${merchantId}, store: ${storeId}`);
    
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock data returned from POS
    return [
      new Product(
        'pos-prod-1',
        merchantId,
        storeId,
        'POS Product A',
        'SKU-POS-A',
        'BAR-POS-A',
        100,
        'https://via.placeholder.com/150',
        'POS Brand'
      ),
      new Product(
        'pos-prod-2',
        merchantId,
        storeId,
        'POS Product B',
        'SKU-POS-B',
        'BAR-POS-B',
        200,
        'https://via.placeholder.com/150',
        'POS Brand'
      ),
    ];
  }
}
