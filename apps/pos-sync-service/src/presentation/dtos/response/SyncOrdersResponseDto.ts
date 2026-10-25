import { SyncOrdersFromClientResponse } from '../../../application/dtos/SyncOrdersFromClientDto';

export interface SyncOrdersResponseDto {
  message: string;
  results: {
    orderId: string;
    globalOrderId: string;
    status: 'synced' | 'already_synced' | 'error';
  }[];
}

export const buildSyncOrdersResponse = ({ results }: SyncOrdersFromClientResponse): SyncOrdersResponseDto => ({
  message: 'Order sync process completed',
  results: results.map(result => ({
    orderId: result.orderId,
    globalOrderId: result.globalOrderId,
    status: result.status,
  })),
});
