export const PIN_LENGTH = 6;
export const PIN_MAX_FAILED_ATTEMPTS = 5;
export const PIN_LOCK_DURATION_MS = 15 * 60 * 1000;
export const PIN_BCRYPT_COST = 12;

export const PinErrorMessage = {
  INVALID_FORMAT: 'pin must be 6 digits',
  REPEATED_DIGITS: 'pin must not be repeated digits',
  SEQUENTIAL_DIGITS: 'pin must not be sequential digits',
  REPEATED_PATTERN: 'pin must not be a repeated pattern',
  COMMON_PIN: 'pin is too common',
  PIN_ALREADY_EXISTS: 'pin record already exists',
  PIN_NOT_FOUND: 'pin record not found',
  PIN_LOCKED: 'pin is locked',
  INVALID_PIN: 'invalid pin',
  SAME_PIN: 'new pin must be different from old pin',
} as const;

export const PinSuccessMessage = {
  CREATE_PIN_SUCCESS: 'pin record created successfully',
  VERIFY_PIN_SUCCESS: 'verify pin success',
  CHANGE_PIN_SUCCESS: 'change pin success',
} as const;

// TODO: ยังไม่ใช่ top 1000 weak PINs ตาม docs/portal/repositories/pin-repository.md
// ต้องแทนที่ด้วย public leaked-password dataset จริง
export const WEAK_PINS: ReadonlySet<string> = new Set([
  '123123', '121212', '112233', '696969', '159753', '135791', '246810', '147258',
  '147852', '741852', '369258', '258369', '789456', '456789', '654123', '321654',
  '102030', '010203', '101010', '202020', '000111', '111000', '123321', '123456',
  '520131', '521314', '131421', '112211', '100200', '200300', '789789', '456456',
  '159159', '357357', '147147', '258258', '369369', '951753', '753951', '852456',
  '123789', '987123', '321123', '010101', '020202', '121314', '131313', '141414',
  '151515', '161616', '171717', '181818', '191919', '200000', '199999', '198989',
  '199090', '199191', '199292', '199393', '199494', '199595', '199696', '199797',
  '199898', '200101', '200202', '200303', '200404', '200505', '200606', '200707',
  '200808', '200909', '201010', '201111', '201212', '666888', '888666', '168168',
  '518518', '555666', '666777', '777888', '888999', '998877', '887766', '776655',
]);
