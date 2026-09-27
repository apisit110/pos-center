import { ProductFromClientResultDTO } from '../../../domain/repositories/IProductRepository';

export interface ReceiveProductsResponseDto {
  message: string;
  results: ProductFromClientResultDTO[];
}

export const buildReceiveProductsResponse = (results: ProductFromClientResultDTO[]): ReceiveProductsResponseDto => ({
  message: 'Products received successfully',
  results,
});
