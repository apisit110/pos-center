import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IStaffRepository } from '../../domain/repositories/IStaffRepository';
import { isFutureDate, addMillisecondsFromNow } from '../../infrastructure/utils/date';
import { InvalidCredentialsError, AccountLockedError } from '../errors/AuthErrors';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const TOKEN_EXPIRES_IN = '30m';

export interface LoginResult {
  token: string;
  staff: {
    uid: string;
    name: string;
    role: string;
    merchantId: string;
  };
}

export class LoginUseCase {
  constructor(
    private staffRepository: IStaffRepository,
    private jwtSecret: string,
  ) {}

  async execute(username: string, pin: string): Promise<LoginResult> {
    const staffMember = await this.staffRepository.getStaffByUsername(username);

    if (!staffMember || !staffMember.pinHash) {
      throw new InvalidCredentialsError();
    }

    if (staffMember.lockedUntil && isFutureDate(staffMember.lockedUntil)) {
      throw new AccountLockedError();
    }

    const pinMatches = await bcrypt.compare(pin, staffMember.pinHash);

    if (!pinMatches) {
      const failedAttempts = (staffMember.failedAttempts ?? 0) + 1;
      const lockedUntil = failedAttempts >= MAX_FAILED_ATTEMPTS
        ? addMillisecondsFromNow(LOCK_DURATION_MS)
        : null;
      await this.staffRepository.recordFailedLogin(staffMember.id, failedAttempts, lockedUntil);
      throw new InvalidCredentialsError();
    }

    await this.staffRepository.recordSuccessfulLogin(staffMember.id);

    const token = jwt.sign(
      { uid: staffMember.id, role: staffMember.role },
      this.jwtSecret,
      { expiresIn: TOKEN_EXPIRES_IN },
    );

    return {
      token,
      staff: {
        uid: staffMember.id,
        name: staffMember.name,
        role: staffMember.role,
        merchantId: staffMember.merchantId,
      },
    };
  }
}
