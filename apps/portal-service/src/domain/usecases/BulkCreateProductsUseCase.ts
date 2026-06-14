import { v4 as uuidv4 } from 'uuid';
import { Product } from '../entities/Product';
import { IProductRepository } from '../repositories/IProductRepository';
import { IMerchantRepository } from '../repositories/IMerchantRepository';

export interface BulkCreateProductItem {
  uid?: string;
  merchantId: string;
  name: string;
  barcode?: string;
  basePrice: number;
  imageUrl?: string[];
  brand?: string;
  unitName?: string;
}

export interface BulkCreateProductsResult {
  created: number;
  errors: Array<{ index: number; name: string; message: string }>;
}

export class BulkCreateProductsUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly merchantRepository: IMerchantRepository
  ) {}

  async execute(items: BulkCreateProductItem[]): Promise<BulkCreateProductsResult> {
    if (items.length === 0) return { created: 0, errors: [] };

    // Validate all unique merchants once upfront
    const uniqueMerchantIds = [...new Set(items.map(p => p.merchantId))];
    const merchantMap = new Map<string, { mid: string }>();
    const errors: BulkCreateProductsResult['errors'] = [];

    for (const merchantId of uniqueMerchantIds) {
      const merchant = await this.merchantRepository.getById(merchantId);
      if (!merchant) {
        // Mark all items for this merchant as failed
        items.forEach((item, index) => {
          if (item.merchantId === merchantId) {
            errors.push({ index, name: item.name, message: `Merchant not found: ${merchantId}` });
          }
        });
      } else {
        merchantMap.set(merchantId, { mid: merchant.mid });
      }
    }

    const validItems = items.filter((_, i) => !errors.find(e => e.index === i));

    if (validItems.length === 0) return { created: 0, errors };

    const productEntities = validItems.map(p => {
      const { mid } = merchantMap.get(p.merchantId)!;
      return new Product(
        p.uid || uuidv4(),
        p.merchantId,
        mid,
        p.name,
        p.barcode || '',
        p.barcode || '',
        p.basePrice,
        p.imageUrl || [],
        p.brand || '',
        p.unitName || ''
      );
    });

    await this.productRepository.bulkSave(productEntities);

    return { created: productEntities.length, errors };
  }
}
