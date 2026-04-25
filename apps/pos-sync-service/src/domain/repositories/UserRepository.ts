import { User, UserSyncLog } from '../entities/User';

export interface UserRepository {
  findByStaffId(staffId: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  upsert(user: Omit<User, 'id'> & { id?: string }): Promise<User>;
  
  findSyncLogByPosTempId(posTempId: string): Promise<UserSyncLog | null>;
  createSyncLog(log: Omit<UserSyncLog, 'id'>): Promise<UserSyncLog>;
  
  addUserBranchAccess(userId: string, branchId: number): Promise<void>;
  clearUserBranchAccess(userId: string): Promise<void>;
}
