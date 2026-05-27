import { User } from '../entities/User';

export interface UserRepository {
  findByUserId(userId: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  upsert(user: Omit<User, 'id'> & { id?: string }): Promise<User>;
  addUserBranchAccess(userId: string, branchId: number): Promise<void>;
  clearUserBranchAccess(userId: string): Promise<void>;
}
