import { SyncTransactionsFromClientResponse } from '../../../application/dtos/SyncTransactionsFromClientDto';

export interface SyncTransactionsResponseDto {
  message: string;
  results: {
    transactionId: string;
    globalTransactionId: string;
    status: 'synced' | 'already_synced' | 'error';
  }[];
}

export const buildSyncTransactionsResponse = ({ results }: SyncTransactionsFromClientResponse): SyncTransactionsResponseDto => ({
  message: 'Transaction sync process completed',
  results: results.map(result => ({
    transactionId: result.transactionId,
    globalTransactionId: result.globalTransactionId,
    status: result.status,
  })),
});
