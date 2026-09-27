import { SyncUserResponseDTO } from '../../../application/usecases/SyncUsersUseCase';

export interface SyncUsersResponseDto {
  message: string;
  results: SyncUserResponseDTO[];
}

export const buildSyncUsersResponse = (results: SyncUserResponseDTO[]): SyncUsersResponseDto => ({
  message: 'User sync process completed',
  results,
});
