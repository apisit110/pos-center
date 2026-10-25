import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { ReceiveProductsFromClientRequest, ReceiveProductsFromClientResponse } from '../dtos/ReceiveProductsFromClientDto';

export class ReceiveProductsFromClientUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute({ mid, sid, products }: ReceiveProductsFromClientRequest): Promise<ReceiveProductsFromClientResponse> {
    const results = await this.productRepository.receiveProductsFromClient(mid, sid, products);
    return { results };
  }
}
