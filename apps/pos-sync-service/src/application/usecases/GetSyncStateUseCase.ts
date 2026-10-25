import { ISyncStateRepository } from '../../domain/repositories/ISyncStateRepository';
import { SyncState } from '../../domain/entities/SyncState';
import { GetSyncStateRequest } from '../dtos/GetSyncStateDto';

export class GetSyncStateUseCase {
  constructor(
    private readonly syncStateRepository: ISyncStateRepository
  ) {}

  async execute({ partnerId, sid, tid }: GetSyncStateRequest): Promise<SyncState> {
    const [productVersion, profileVersion] = await Promise.all([
      this.syncStateRepository.findProductVersion(partnerId, sid),
      this.syncStateRepository.findProfileVersion(partnerId, tid),
    ]);
    return new SyncState(productVersion, profileVersion);
  }

  /** For push responses: the data is already saved, so a failed lookup only leaves out `syncState`. */
  async executeOrNull(request: GetSyncStateRequest): Promise<SyncState | null> {
    try {
      return await this.execute(request);
    } catch (error) {
      console.error('[GetSyncStateUseCase] Error:', error);
      return null;
    }
  }
}
