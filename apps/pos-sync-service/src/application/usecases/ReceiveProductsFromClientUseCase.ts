import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { ReceiveProductsFromClientRequest, ReceiveProductsFromClientResponse } from '../dtos/ReceiveProductsFromClientDto';

export class ReceiveProductsFromClientUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute({ partnerId, sid, products }: ReceiveProductsFromClientRequest): Promise<ReceiveProductsFromClientResponse> {
    const results = await this.productRepository.receiveProductsFromClient(partnerId, sid, products);
    return { results };
  }
}
