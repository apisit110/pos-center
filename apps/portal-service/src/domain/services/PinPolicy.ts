import { PIN_LENGTH, PinErrorMessage, WEAK_PINS } from '../constants/pin';

export interface PinValidationResult {
  status: 'success' | 'failed';
  message?: string;
}

const PIN_FORMAT = new RegExp(`^\\d{${PIN_LENGTH}}$`);

const fail = (message: string): PinValidationResult => ({ status: 'failed', message });

export function validatePinFormat(pin: string): PinValidationResult {
  return PIN_FORMAT.test(pin) ? { status: 'success' } : fail(PinErrorMessage.INVALID_FORMAT);
}

function isRepeatedDigits(pin: string): boolean {
  return pin.split('').every((digit) => digit === pin[0]);
}

function isSequentialDigits(pin: string): boolean {
  const digits = pin.split('').map(Number);
  const diffs = digits.slice(1).map((digit, i) => digit - digits[i]);
  return diffs.every((diff) => diff === 1) || diffs.every((diff) => diff === -1);
}

function isRepeatedPattern(pin: string): boolean {
  const twoDigitsRepeated = pin.slice(0, 2).repeat(3) === pin;
  const threeDigitsRepeated = pin.slice(0, 3).repeat(2) === pin;
  const pairedDigits = pin[0] === pin[1] && pin[2] === pin[3] && pin[4] === pin[5];
  return twoDigitsRepeated || threeDigitsRepeated || pairedDigits;
}

export function validatePinPolicy(pin: string): PinValidationResult {
  const format = validatePinFormat(pin);
  if (format.status === 'failed') return format;
  if (isRepeatedDigits(pin)) return fail(PinErrorMessage.REPEATED_DIGITS);
  if (isSequentialDigits(pin)) return fail(PinErrorMessage.SEQUENTIAL_DIGITS);
  if (isRepeatedPattern(pin)) return fail(PinErrorMessage.REPEATED_PATTERN);
  if (WEAK_PINS.has(pin)) return fail(PinErrorMessage.COMMON_PIN);
  return { status: 'success' };
}
