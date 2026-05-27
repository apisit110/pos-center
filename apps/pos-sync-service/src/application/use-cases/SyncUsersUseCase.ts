import { UserRepository } from '../../domain/repositories/UserRepository';

export interface SyncUserDTO {
  userId: string;
  fullName: string;
  pinHash: string;
  roleId: number;
  branchIds: number[];
  status: 'active' | 'inactive';
  originBranchId: number;
}

export interface SyncUserResponseDTO {
  userId: string;
  status: 'synced' | 'already_synced' | 'error';
}

export class SyncUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(usersToSync: SyncUserDTO[]): Promise<SyncUserResponseDTO[]> {
    const results: SyncUserResponseDTO[] = [];

    for (const userData of usersToSync) {
      try {
        // 1. Check idempotency — userId is unique (merchant-prefixed from cashier)
        const existingUser = await this.userRepository.findByUserId(userData.userId);
        if (existingUser) {
          results.push({ userId: userData.userId, status: 'already_synced' });
          continue;
        }

        // 2. Upsert user using cashier's userId directly
        const user = await this.userRepository.upsert({
          userId: userData.userId,
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

        results.push({ userId: user.userId, status: 'synced' });
      } catch (error) {
        console.error(`Error syncing user ${userData.userId}:`, error);
        results.push({ userId: userData.userId, status: 'error' });
      }
    }

    return results;
  }
}
