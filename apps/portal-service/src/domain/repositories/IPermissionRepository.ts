export interface IPermissionRepository {
  getPermissionsByStaffUid(staffUid: string): Promise<string[]>;
}
