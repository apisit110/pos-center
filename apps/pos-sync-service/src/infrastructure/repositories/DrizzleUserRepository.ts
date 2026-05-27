import { db, users, userBranchAccess, eq } from '@pos-center/database';
import { User, UserStatus } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class DrizzleUserRepository implements UserRepository {
  async findByUserId(userId: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.userId, userId)).limit(1);
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
          userId: userData.userId,
          fullName: userData.fullName,
          pinHash: userData.pinHash,
          roleId: userData.roleId,
          status: userData.status,
        })
        .returning();
      return this.mapToUserEntity(result[0]);
    }
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
      row.userId,
      row.fullName,
      row.pinHash,
      row.roleId,
      row.status as UserStatus,
      row.createdAt,
      row.updatedAt
    );
  }
}
