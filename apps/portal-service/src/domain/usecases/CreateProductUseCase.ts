import { Product } from '../entities/Product';
import { IProductRepository } from '../repositories/IProductRepository';
import { IMerchantRepository } from '../repositories/IMerchantRepository';
import { v4 as uuidv4 } from 'uuid';

export interface CreateProductRequest {
  uid?: string;
  merchantId: string;
  name: string;
  sku: string;
  barcode: string;
  basePrice: number;
  imageUrl: string[];
  brand: string;
  unitName: string;
}

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly merchantRepository: IMerchantRepository
  ) {}

  public async execute(request: CreateProductRequest): Promise<Product> {
    const uid = request.uid || uuidv4();

    // Resolve merchant to get mid
    const merchant = await this.merchantRepository.getById(request.merchantId);
    if (!merchant) {
      throw new Error(`Merchant not found: ${request.merchantId}`);
    }

    const product = new Product(
      uid,
      request.merchantId,
      merchant.mid,
      request.name,
      request.sku,
      request.barcode,
      request.basePrice,
      request.imageUrl,
      request.brand,
      request.unitName
    );

    await this.productRepository.save(product);

    return product;
  }
}
