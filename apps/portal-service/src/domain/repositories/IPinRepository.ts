export interface PinRecord {
  uuid: string;
  username: string;
  pinFailedAttempts: number;
  pinLockedUntil: Date | null;
  createdAt: Date;
}

export interface PinResult {
  status: 'success' | 'failed';
  message: string;
}

export interface IPinRepository {
  getPin(appId: string, username: string): Promise<PinRecord | null>;
  createPin(appId: string, username: string, pin: string): Promise<PinResult>;
  verifyPin(appId: string, username: string, pin: string): Promise<PinResult>;
  changePin(appId: string, username: string, oldPin: string, newPin: string): Promise<PinResult>;
}
