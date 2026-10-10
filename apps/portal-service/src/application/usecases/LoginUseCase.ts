import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { IPinRepository } from '../../domain/repositories/IPinRepository';
import { IPermissionRepository } from '../../domain/repositories/IPermissionRepository';
import { ITokenService } from '../../domain/services/ITokenService';
import { PinErrorMessage } from '../../domain/constants/pin';
import { ServiceError } from '../errors/ServiceError';
import { ValidationError } from '../errors/ValidationError';

export interface LoginResult {
  token: string;
  user: {
    uid: string;
    name: string;
    merchantId: string;
  };
}

export class LoginUseCase {
  constructor(
    private staffRepository: IStaffRepository,
    private pinRepository: IPinRepository,
    private permissionRepository: IPermissionRepository,
    private tokenService: ITokenService,
    private appId: string,
  ) {}

  async execute(username: string, pin: string): Promise<LoginResult> {
    const staff = await this.staffRepository.getStaffByUsername(username);
    if (!staff) throw ServiceError.ErrIncorrectUsernameOrPin();

    switch (staff.status) {
      case 'PENDING': throw ServiceError.ErrUserPending();
      case 'INACTIVE': throw ServiceError.ErrUserInactive();
      case 'SUSPENDED': throw ServiceError.ErrUserSuspended();
      case 'ACTIVE': break;
      default: throw ServiceError.ErrUserInactive();
    }

    const verified = await this.pinRepository.verifyPin(this.appId, username, pin);
    if (verified.status === 'failed') {
      switch (verified.message) {
        case PinErrorMessage.PIN_LOCKED: throw ServiceError.ErrPinLocked();
        case PinErrorMessage.INVALID_FORMAT: throw ValidationError.ErrInvalidRequest();
        default: throw ServiceError.ErrIncorrectUsernameOrPin();
      }
    }

    const permissions = await this.permissionRepository.getPermissionsByStaffUid(staff.id);
    const token = this.tokenService.signAccessToken({ uid: staff.id, role: staff.role, permissions });

    return {
      token,
      user: { uid: staff.id, name: staff.name, merchantId: staff.merchantId },
    };
  }
}
