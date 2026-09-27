import { SyncTransactionResponseDTO } from '../../../application/usecases/SyncTransactionsFromClientUseCase';

export interface SyncTransactionsResponseDto {
  message: string;
  results: SyncTransactionResponseDTO[];
}

export const buildSyncTransactionsResponse = (results: SyncTransactionResponseDTO[]): SyncTransactionsResponseDto => ({
  message: 'Transaction sync process completed',
  results,
});
