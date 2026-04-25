import { UserRepository } from '../../domain/repositories/UserRepository';
import { User, UserStatus } from '../../domain/entities/User';

export interface SyncUserDTO {
  posTempId: string;
  staffId: string;
  fullName: string;
  pinHash: string;
  roleId: number;
  branchIds: number[];
  status: UserStatus;
  originBranchId: number;
}

export interface SyncUserResponseDTO {
  posTempId: string;
  globalUserId: string;
  status: 'synced' | 'already_synced' | 'error';
}

export class SyncUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(usersToSync: SyncUserDTO[]): Promise<SyncUserResponseDTO[]> {
    const results: SyncUserResponseDTO[] = [];

    for (const userData of usersToSync) {
      try {
        // 1. Check idempotency
        const existingLog = await this.userRepository.findSyncLogByPosTempId(userData.posTempId);
        if (existingLog) {
          results.push({
            posTempId: userData.posTempId,
            globalUserId: existingLog.globalUserId,
            status: 'already_synced',
          });
          continue;
        }

        // 2. Upsert user
        // We use staffId to find existing user if any
        let existingUser = await this.userRepository.findByStaffId(userData.staffId);
        
        const user = await this.userRepository.upsert({
          id: existingUser?.id,
          staffId: userData.staffId,
          fullName: userData.fullName,
          pinHash: userData.pinHash,
          roleId: userData.roleId,
          status: userData.status,
        });

        // 3. Update branch access
        await this.userRepository.clearUserBranchAccess(user.id);
        for (const branchId of userData.branchIds) {
          await this.userRepository.addUserBranchAccess(user.id, branchId);
        }

        // 4. Create sync log
        await this.userRepository.createSyncLog({
          posTempId: userData.posTempId,
          originBranchId: userData.originBranchId,
          globalUserId: user.id,
        });

        results.push({
          posTempId: userData.posTempId,
          globalUserId: user.id,
          status: 'synced',
        });
      } catch (error) {
        console.error(`Error syncing user ${userData.staffId}:`, error);
        results.push({
          posTempId: userData.posTempId,
          globalUserId: '',
          status: 'error',
        });
      }
    }

    return results;
  }
}
