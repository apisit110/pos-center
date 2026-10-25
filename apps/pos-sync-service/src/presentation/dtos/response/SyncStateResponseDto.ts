import { SyncState } from '../../../domain/entities/SyncState';

export interface SyncStateResponseDto {
  productVersion: number;
  profileVersion: string;
}

export interface PullSyncStateResponseDto extends SyncStateResponseDto {
  message: string;
}

export const buildSyncStateResponse = ({ productVersion, profileVersion }: SyncState): SyncStateResponseDto => ({
  productVersion,
  profileVersion,
});

export const buildPullSyncStateResponse = (syncState: SyncState): PullSyncStateResponseDto => ({
  message: 'Sync completed successfully',
  ...buildSyncStateResponse(syncState),
});

/** `syncState` of a push response, left out when the lookup failed */
export const buildPushSyncState = (syncState: SyncState | null): { syncState?: SyncStateResponseDto } =>
  syncState ? { syncState: buildSyncStateResponse(syncState) } : {};
