import { SyncOrderResponseDTO } from '../../../application/usecases/SyncOrdersFromClientUseCase';

export interface SyncOrdersResponseDto {
  message: string;
  results: SyncOrderResponseDTO[];
}

export const buildSyncOrdersResponse = (results: SyncOrderResponseDTO[]): SyncOrdersResponseDto => ({
  message: 'Order sync process completed',
  results,
});
