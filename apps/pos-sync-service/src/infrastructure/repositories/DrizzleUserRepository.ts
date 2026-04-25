import { db, users, userSyncLogs, userBranchAccess, eq, and } from '@lightning/database';
import { User, UserSyncLog, UserStatus } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class DrizzleUserRepository implements UserRepository {
  async findByStaffId(staffId: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.staffId, staffId)).limit(1);
    if (result.length === 0) return null;
    return this.mapToUserEntity(result[0]);
  }

  async findById(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (result.length === 0) return null;
    return this.mapToUserEntity(result[0]);
  }

  async upsert(userData: Omit<User, 'id'> & { id?: string }): Promise<User> {
    if (userData.id) {
      const result = await db.update(users)
        .set({
          fullName: userData.fullName,
          pinHash: userData.pinHash,
          roleId: userData.roleId,
          status: userData.status,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userData.id))
        .returning();
      return this.mapToUserEntity(result[0]);
    } else {
      const result = await db.insert(users)
        .values({
          staffId: userData.staffId,
          fullName: userData.fullName,
          pinHash: userData.pinHash,
          roleId: userData.roleId,
          status: userData.status,
        })
        .returning();
      return this.mapToUserEntity(result[0]);
    }
  }

  async findSyncLogByPosTempId(posTempId: string): Promise<UserSyncLog | null> {
    const result = await db.select().from(userSyncLogs).where(eq(userSyncLogs.posTempId, posTempId)).limit(1);
    if (result.length === 0) return null;
    const log = result[0];
    return new UserSyncLog(log.id, log.posTempId, log.originBranchId, log.globalUserId);
  }

  async createSyncLog(log: Omit<UserSyncLog, 'id'>): Promise<UserSyncLog> {
    const result = await db.insert(userSyncLogs)
      .values({
        posTempId: log.posTempId,
        originBranchId: log.originBranchId,
        globalUserId: log.globalUserId,
      })
      .returning();
    const newLog = result[0];
    return new UserSyncLog(newLog.id, newLog.posTempId, newLog.originBranchId, newLog.globalUserId);
  }

  async addUserBranchAccess(userId: string, branchId: number): Promise<void> {
    await db.insert(userBranchAccess).values({
      userId,
      branchId,
    });
  }

  async clearUserBranchAccess(userId: string): Promise<void> {
    await db.delete(userBranchAccess).where(eq(userBranchAccess.userId, userId));
  }

  private mapToUserEntity(row: any): User {
    return new User(
      row.id,
      row.staffId,
      row.fullName,
      row.pinHash,
      row.roleId,
      row.status as UserStatus,
      row.createdAt,
      row.updatedAt
    );
  }
}
