import { Product } from '../../domain/entities/Product';
import { IProductRepository } from '../repositories/IProductRepository';
import { v4 as uuidv4 } from 'uuid';

export interface CreateProductRequest {
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
  constructor(private readonly productRepository: IProductRepository) {}

  public async execute(request: CreateProductRequest): Promise<Product> {
    const id = uuidv4();
    
    const product = new Product(
      id,
      request.merchantId,
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
