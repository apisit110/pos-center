import { IProductRepository, ProductFromClientDTO, ProductFromClientResultDTO } from '../repositories/IProductRepository';

export class ReceiveProductsFromClientUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(mid: string, sid: string, products: ProductFromClientDTO[]): Promise<ProductFromClientResultDTO[]> {
    return this.productRepository.receiveProductsFromClient(mid, sid, products);
  }
}
