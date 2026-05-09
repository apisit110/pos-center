import { ProductRepository, CreateProductRequest } from '../repositories/ProductRepository';

export class BatchCreateProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  public async execute(requests: CreateProductRequest[]): Promise<{ created: number; errors: string[] }> {
    return this.productRepository.createProducts(requests);
  }
}
