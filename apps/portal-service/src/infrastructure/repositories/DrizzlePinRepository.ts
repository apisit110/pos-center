import bcrypt from 'bcryptjs';
import { db, pins } from '@pos-center/database';
import { and, eq, sql } from 'drizzle-orm';
import { IPinRepository, PinRecord, PinResult } from '../../domain/repositories/IPinRepository';
import { validatePinFormat, validatePinPolicy } from '../../domain/services/PinPolicy';
import {
  PIN_BCRYPT_COST,
  PIN_LOCK_DURATION_MS,
  PIN_MAX_FAILED_ATTEMPTS,
  PinErrorMessage,
  PinSuccessMessage,
} from '../../domain/constants/pin';
import { addMillisecondsFromNow, isFutureDate } from '../utils/date';

const UNIQUE_VIOLATION = '23505';
const DUMMY_HASH = bcrypt.hashSync('dummy-pin-for-timing-safety', PIN_BCRYPT_COST);

const failed = (message: string): PinResult => ({ status: 'failed', message });
const success = (message: string): PinResult => ({ status: 'success', message });

export class DrizzlePinRepository implements IPinRepository {
  async getPin(appId: string, username: string): Promise<PinRecord | null> {
    const rows = await db.select({
      uuid: pins.uuid,
      username: pins.username,
      pinFailedAttempts: pins.pinFailedAttempts,
      pinLockedUntil: pins.pinLockedUntil,
      createdAt: pins.createdAt,
    }).from(pins).where(this.byAppAndUsername(appId, username)).limit(1);
    return rows[0] ?? null;
  }

  async createPin(appId: string, username: string, pin: string): Promise<PinResult> {
    const policy = validatePinPolicy(pin);
    if (policy.status === 'failed') return failed(policy.message!);

    if (await this.findPin(appId, username)) return failed(PinErrorMessage.PIN_ALREADY_EXISTS);

    const pinHash = await bcrypt.hash(pin, PIN_BCRYPT_COST);
    try {
      await db.insert(pins).values({ appId, username, pinHash });
    } catch (error) {
      if ((error as { code?: string }).code === UNIQUE_VIOLATION) {
        return failed(PinErrorMessage.PIN_ALREADY_EXISTS);
      }
      throw error;
    }
    return success(PinSuccessMessage.CREATE_PIN_SUCCESS);
  }

  async verifyPin(appId: string, username: string, pin: string): Promise<PinResult> {
    const format = validatePinFormat(pin);
    if (format.status === 'failed') return failed(format.message!);

    const record = await this.findPin(appId, username);
    if (!record) {
      await bcrypt.compare(pin, DUMMY_HASH);
      console.warn(`[DrizzlePinRepository] ${PinErrorMessage.PIN_NOT_FOUND}: app_id=${appId}`);
      return failed(PinErrorMessage.INVALID_PIN);
    }

    if (record.pinLockedUntil && isFutureDate(record.pinLockedUntil)) {
      return failed(PinErrorMessage.PIN_LOCKED);
    }

    if (record.pinLockedUntil) {
      await this.resetAttempts(appId, username);
    }

    if (await bcrypt.compare(pin, record.pinHash)) {
      await this.resetAttempts(appId, username);
      return success(PinSuccessMessage.VERIFY_PIN_SUCCESS);
    }

    const [updated] = await db.update(pins)
      .set({ pinFailedAttempts: sql`${pins.pinFailedAttempts} + 1`, updatedAt: new Date() })
      .where(this.byAppAndUsername(appId, username))
      .returning({ pinFailedAttempts: pins.pinFailedAttempts });

    if (updated && updated.pinFailedAttempts >= PIN_MAX_FAILED_ATTEMPTS) {
      await db.update(pins)
        .set({ pinLockedUntil: addMillisecondsFromNow(PIN_LOCK_DURATION_MS), updatedAt: new Date() })
        .where(this.byAppAndUsername(appId, username));
    }
    return failed(PinErrorMessage.INVALID_PIN);
  }

  async changePin(appId: string, username: string, oldPin: string, newPin: string): Promise<PinResult> {
    const oldFormat = validatePinFormat(oldPin);
    if (oldFormat.status === 'failed') return failed(oldFormat.message!);

    const policy = validatePinPolicy(newPin);
    if (policy.status === 'failed') return failed(policy.message!);

    if (newPin === oldPin) return failed(PinErrorMessage.SAME_PIN);

    const verified = await this.verifyPin(appId, username, oldPin);
    if (verified.status === 'failed') return verified;

    const pinHash = await bcrypt.hash(newPin, PIN_BCRYPT_COST);
    await db.update(pins)
      .set({ pinHash, pinFailedAttempts: 0, pinLockedUntil: null, updatedAt: new Date() })
      .where(this.byAppAndUsername(appId, username));
    return success(PinSuccessMessage.CHANGE_PIN_SUCCESS);
  }

  private byAppAndUsername(appId: string, username: string) {
    return and(eq(pins.appId, appId), eq(pins.username, username));
  }

  private async findPin(appId: string, username: string) {
    const rows = await db.select().from(pins).where(this.byAppAndUsername(appId, username)).limit(1);
    return rows[0] ?? null;
  }

  private async resetAttempts(appId: string, username: string): Promise<void> {
    await db.update(pins)
      .set({ pinFailedAttempts: 0, pinLockedUntil: null, updatedAt: new Date() })
      .where(this.byAppAndUsername(appId, username));
  }
}
