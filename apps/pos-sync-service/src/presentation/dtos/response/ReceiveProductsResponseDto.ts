import { ReceiveProductsFromClientResponse } from '../../../application/dtos/ReceiveProductsFromClientDto';

export interface ReceiveProductsResponseDto {
  message: string;
  results: {
    id: string;
    status: 'synced' | 'already_synced' | 'error';
    error?: string;
  }[];
}

export const buildReceiveProductsResponse = ({ results }: ReceiveProductsFromClientResponse): ReceiveProductsResponseDto => ({
  message: 'Products received successfully',
  results: results.map(result => ({
    id: result.id,
    status: result.status,
    error: result.error,
  })),
});
