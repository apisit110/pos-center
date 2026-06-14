import { ProductRepository, CreateProductRequest } from '../repositories/ProductRepository';

export class BatchCreateProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  public async execute(
    requests: CreateProductRequest[],
    onProgress?: (done: number, total: number) => void
  ): Promise<{ created: number; errors: string[] }> {
    return this.productRepository.createProducts(requests, onProgress);
  }
}
