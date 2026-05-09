import { Product } from '../../domain/entities/Product';
import { ProductRepository, CreateProductRequest } from '../repositories/ProductRepository';

export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  public async execute(request: CreateProductRequest): Promise<Product> {
    return this.productRepository.createProduct(request);
  }
}
