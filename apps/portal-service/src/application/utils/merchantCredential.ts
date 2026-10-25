import { createHash, randomBytes } from 'crypto';

/** `cid_` + 16 random bytes as hex */
export const generateClientId = (): string => `cid_${randomBytes(16).toString('hex')}`;

/** `cs_` + 32 random bytes as base64url, returned to the caller only once and never stored or logged */
export const generateClientSecret = (): string => `cs_${randomBytes(32).toString('base64url')}`;

/** The secret is random and high entropy, so SHA-256 (hex) is enough (no slow hash needed). */
export const hashClientSecret = (secret: string): string => createHash('sha256').update(secret).digest('hex');
