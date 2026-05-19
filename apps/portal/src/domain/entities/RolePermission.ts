export class RolePermission {
  constructor(
    public readonly roleId: number,
    public readonly permissionKey: string,
    public isGranted: boolean
  ) {}
}
