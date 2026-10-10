# Pin Repository

มองว่าเป็น external service ที่เก็บ PIN ของผู้ใช้แต่ละ appId + username โดยไม่เก็บ PIN จริง แต่เก็บเป็น hash (bcrypt cost 12) และมีระบบ lock / wrong attempt

## PIN policy

`createPin` ต้องตรวจสอบ PIN policy เต็ม (`validatePinPolicy`, rule 1-5) เป็นขั้นตอนแรกก่อน query DB ถ้าไม่ผ่านให้ return `status = failed` ทันที

`verifyPin` ตรวจแค่ format (`validatePinFormat`, rule 1 คือ `/^\d{6}$/`) ก่อน query DB ถ้าไม่ผ่านให้ return `status = failed` ทันที (ไม่นับเป็น wrong attempt) ไม่ตรวจ rule 2-5 เพื่อไม่ให้ผู้ใช้เดิมที่ตั้ง PIN ไว้ก่อนเปลี่ยน policy/blacklist login ไม่ได้

| #   | Rule                      | เงื่อนไข                                                                     | ตัวอย่างที่ไม่ผ่าน                     |
| --- | ------------------------- | ---------------------------------------------------------------------------- | -------------------------------------- |
| 1   | Format                    | ต้องเป็นตัวเลข 0-9 จำนวน 6 หลักเท่านั้น (`/^\d{6}$/`)                        | `12345`, `12a456`                      |
| 2   | Repeated Digits           | ห้ามใช้ตัวเลขเดียวกันทั้งหมด                                                 | `111111`, `000000`, `999999`           |
| 3   | Sequential Digits         | ห้ามเรียงกันทั้งแบบขึ้น (+1) และลง (-1) (ไม่นับแบบวนรอบ เช่น `890123` ไม่ถือเป็น sequential) | `123456`, `234567`, `654321`, `987654` |
| 4   | Pattern Repetition        | ห้ามชุด 2 หลักซ้ำ 3 รอบ (`pin[0..1]` x 3), ชุด 3 หลักซ้ำ 2 รอบ (`pin[0..2]` x 2) หรือเลขคู่ซ้ำเป็นชุด (`aabbcc`) (range นับรวมตำแหน่งปลาย) | `121212`, `123123`, `112233`           |
| 5   | Common/Weak PIN Blacklist | ห้ามอยู่ใน list PIN ยอดนิยม (top 1000 weak PINs 6 หลักจาก public leaked-password dataset เก็บเป็น constant ใน code) และต้องผ่าน rule 1-4 มาก่อน | `135791`, `159753`, `520131`           |

## Error Message

| Error Code         | Message                            | ใช้ใน                     |
| ------------------ | ---------------------------------- | ------------------------- |
| INVALID_FORMAT     | pin must be 6 digits               | validatePinFormat, validatePinPolicy |
| REPEATED_DIGITS    | pin must not be repeated digits    | validatePinPolicy         |
| SEQUENTIAL_DIGITS  | pin must not be sequential digits  | validatePinPolicy         |
| REPEATED_PATTERN   | pin must not be a repeated pattern | validatePinPolicy         |
| COMMON_PIN         | pin is too common                  | validatePinPolicy         |
| PIN_ALREADY_EXISTS | pin record already exists          | createPin                 |
| PIN_NOT_FOUND      | pin record not found               | verifyPin (internal log เท่านั้น ไม่ส่งให้ client) |
| PIN_LOCKED         | pin is locked                      | verifyPin                 |
| INVALID_PIN        | invalid pin                        | verifyPin (รวมกรณีไม่พบ record) |
| SAME_PIN           | new pin must be different from old pin | changePin             |

## Success Message

| Code               | Message                         | ใช้ใน     |
| ------------------ | ------------------------------- | --------- |
| CREATE_PIN_SUCCESS | pin record created successfully | createPin |
| VERIFY_PIN_SUCCESS | verify pin success              | verifyPin |
| CHANGE_PIN_SUCCESS | change pin success              | changePin |

## Share function

```mermaid
flowchart TD
    Start([validatePinPolicy pin]) --> Format{"Is 6 digits?<br/>check: /^\d{6}$/"}
    Format -- No --> RetFormat(["return<br/>status = failed<br/>message = ErrorMessage.INVALID_FORMAT"])
    Format -- Yes --> Repeated{"All digits the same?<br/>e.g. 111111"}
    Repeated -- Yes --> RetRepeated(["return<br/>status = failed<br/>message = ErrorMessage.REPEATED_DIGITS"])
    Repeated -- No --> Sequential{"Sequential digits?<br/>every diff = +1 or every diff = -1<br/>e.g. 123456, 654321"}
    Sequential -- Yes --> RetSequential(["return<br/>status = failed<br/>message = ErrorMessage.SEQUENTIAL_DIGITS"])
    Sequential -- No --> Pattern{"Repeated pattern?<br/>pin[0..1] x 3 (121212)<br/>OR pin[0..2] x 2 (123123)<br/>OR aabbcc (112233)"}
    Pattern -- Yes --> RetPattern(["return<br/>status = failed<br/>message = ErrorMessage.REPEATED_PATTERN"])
    Pattern -- No --> Blacklist{"In weak PIN blacklist?"}
    Blacklist -- Yes --> RetBlacklist(["return<br/>status = failed<br/>message = ErrorMessage.COMMON_PIN"])
    Blacklist -- No --> RetPass(["return<br/>status = success"])
```

## interface

### getPin

parameters

```json
{
  "appId": "string",
  "username": "string"
}
```

return

```json
{
  "uuid": "string",
  "username": "string",
  "pinFailedAttempts": 0,
  "pinLockedUntil": "string format iso8601",
  "createdAt": "string format iso8601"
}
```

หมายเหตุ: `getPin` ไม่ return `pinHash` เด็ดขาด และ return `null` ถ้าไม่พบ record

หมายเหตุ: timestamp ทุก field เก็บใน database เป็น UTC (+0) ส่วนการแปลง timezone ทำที่ฝั่ง app

implementation

```mermaid
flowchart TD
    Start([getPin appId, username]) --> Find[Query pin record by appId + username]
    Find --> Exists{Record exists?}
    Exists -- Yes --> RetRecord([return pin record])
    Exists -- No --> RetNull([return null])
    RetRecord --> End([end])
    RetNull --> End
```

### createPin

parameters

```json
{
  "appId": "string",
  "username": "string",
  "pin": "string"
}
```

return

```json
{
  "status": "success|failed",
  "message": "string"
}
```

implementation

```mermaid
flowchart TD
    Start([createPin appId, username, pin]) --> Policy{"Pass PIN policy?<br/>validatePinPolicy(pin)"}
    Policy -- No --> RetPolicy(["return status = failed<br/>message = ErrorMessage from validatePinPolicy"])
    Policy -- Yes --> Find[Query pin record by appId + username]
    Find --> Exists{Record exists?}
    Exists -- Yes --> RetFailed(["return status = failed<br/>message = ErrorMessage.PIN_ALREADY_EXISTS"])
    Exists -- No --> Hash["Hash pin<br/>pinHash = bcrypt.hash(pin, 12)"]
    Hash --> Create["Insert new pin record<br/>appId, username, pin_hash = pinHash"]
    Create --> Dup{"Unique violation?<br/>(appId + username)"}
    Dup -- Yes --> RetFailed
    Dup -- No --> RetSuccess(["return status = success<br/>message = SuccessMessage.CREATE_PIN_SUCCESS"])
    RetPolicy --> End([end])
    RetFailed --> End
    RetSuccess --> End
```

หมายเหตุ: `Exists` check กัน case ปกติ ส่วน unique index `(app_id, username)` ใน DB กัน race condition

### verifyPin

parameters

```json
{
  "appId": "string",
  "username": "string",
  "pin": "string"
}
```

return

```json
{
  "status": "success|failed",
  "message": "string"
}
```

implementation

```mermaid
flowchart TD
    Start([verifyPin appId, username, pin]) --> Policy{"Valid format?<br/>validatePinFormat(pin)"}
    Policy -- No --> RetPolicy(["return<br/>status = failed<br/>message = ErrorMessage.INVALID_FORMAT"])
    Policy -- Yes --> Find[Query pin record by appId + username]
    Find --> Exists{Record exists?}
    Exists -- No --> Dummy["Dummy compare (กัน timing attack)<br/>bcrypt.compare(pin, DUMMY_HASH)<br/>log ErrorMessage.PIN_NOT_FOUND (internal)"]
    Dummy --> RetFalseNotFound(["return<br/>status = failed<br/>message = ErrorMessage.INVALID_PIN"])

    Exists -- Yes --> Locked{"Is PIN locked?<br/>check: pin_locked_until != null<br/>AND pin_locked_until > now"}
    Locked -- "Yes (still locked)" --> RetFalseLocked(["return<br/>status = failed<br/>message = ErrorMessage.PIN_LOCKED"])

    Locked -- "No" --> Expired{"Lock expired?<br/>check: pin_locked_until != null<br/>(and <= now)"}
    Expired -- "Yes (lock expired)" --> AutoReset["Auto reset<br/>Save to DB<br/>SET pin_failed_attempts = 0,<br/>pin_locked_until = null<br/>WHERE appId + username"]
    AutoReset --> Compare
    Expired -- "No (never locked)" --> Compare{"Is PIN correct?<br/>check: compare input pin<br/>with pin_hash (e.g. bcrypt.compare)"}
    Compare -- Yes --> Reset["Reset wrong attempts<br/>Save to DB<br/>SET pin_failed_attempts = 0,<br/>pin_locked_until = null<br/>WHERE appId + username"]
    Reset --> RetTrue(["return<br/>status = success<br/>message = SuccessMessage.VERIFY_PIN_SUCCESS"])

    Compare -- No --> Inc["Count wrong attempt<br/>pin_failed_attempts = pin_failed_attempts + 1"]
    Inc --> Over{"Too many wrong attempts?<br/>check: pin_failed_attempts >= 5 (ผิดครั้งที่ 5 lock)"}
    Over -- Yes --> Lock["Lock PIN for 15 minutes<br/>pin_locked_until = now + 15 minutes"]
    Lock --> SaveLock["Save to DB<br/>update pin_failed_attempts, pin_locked_until"]
    SaveLock --> RetFalseWrong(["return<br/>status = failed<br/>message = ErrorMessage.INVALID_PIN"])
    Over -- No --> SaveInc["Save to DB<br/>update pin_failed_attempts"]
    SaveInc --> RetFalseWrong
```

หมายเหตุ: ผิดครั้งที่ 5 จะ lock 15 นาที (`pin_failed_attempts >= 5`)

หมายเหตุ: เมื่อ lock หมดอายุ `verifyPin` จะ reset `pin_failed_attempts = 0` และ `pin_locked_until = null` ให้อัตโนมัติก่อนตรวจ PIN ทำให้ผู้ใช้ได้โอกาสผิดครบ 5 ครั้งใหม่

ข้อเสนอในอนาคต: เพิ่มเวลา lock แบบ escalating (เช่น 15 นาที, 1 ชั่วโมง, 24 ชั่วโมง) ต้องเพิ่ม column เก็บจำนวนครั้งที่ถูก lock

หมายเหตุ: กรณีไม่พบ record ต้อง return `INVALID_PIN` เหมือนกรณี PIN ผิด และรัน `bcrypt.compare` กับ `DUMMY_HASH` (hash cost 12 ที่สร้างไว้ล่วงหน้า) เพื่อให้เวลาตอบใกล้เคียงกัน กัน user enumeration ส่วน `PIN_LOCKED` ยัง return ตามเดิมเพื่อให้ผู้ใช้ทราบสถานะ









### changePin

parameters

```json
{
  "appId": "string",
  "username": "string",
  "oldPin": "string",
  "newPin": "string"
}
```

return

```json
{
  "status": "success|failed",
  "message": "string"
}
```

implementation

```mermaid
flowchart TD
    Start([changePin appId, username, oldPin, newPin]) --> OldFormat{"Valid old pin format?<br/>validatePinFormat(oldPin)"}
    OldFormat -- No --> RetOldFormat(["return<br/>status = failed<br/>message = ErrorMessage.INVALID_FORMAT"])
    OldFormat -- Yes --> Policy{"Pass PIN policy?<br/>validatePinPolicy(newPin)"}
    Policy -- No --> RetPolicy(["return<br/>status = failed<br/>message = ErrorMessage from validatePinPolicy"])
    Policy -- Yes --> Same{"New pin same as old pin?<br/>newPin == oldPin"}
    Same -- Yes --> RetSame(["return<br/>status = failed<br/>message = ErrorMessage.SAME_PIN"])
    Same -- No --> Verify["Verify old pin<br/>verifyPin(appId, username, oldPin)<br/>(รวมตรวจ lock, นับ wrong attempt, dummy compare)"]
    Verify --> Verified{"verifyPin status = success?"}
    Verified -- No --> RetVerify(["return<br/>status = failed<br/>message = ErrorMessage from verifyPin<br/>(INVALID_PIN / PIN_LOCKED)"])
    Verified -- Yes --> Hash["Hash new pin<br/>pinHash = bcrypt.hash(newPin, 12)"]
    Hash --> Save["Save to DB<br/>SET pin_hash = pinHash,<br/>pin_failed_attempts = 0,<br/>pin_locked_until = null<br/>WHERE appId + username"]
    Save --> RetSuccess(["return<br/>status = success<br/>message = SuccessMessage.CHANGE_PIN_SUCCESS"])
    RetOldFormat --> End([end])
    RetPolicy --> End
    RetSame --> End
    RetVerify --> End
    RetSuccess --> End
```

หมายเหตุ: ตรวจ `oldPin` ด้วย `verifyPin` เพื่อให้ใช้กติกา lock / นับ wrong attempt เดียวกัน ถ้า `oldPin` ผิดจะถูกนับเป็น wrong attempt ตามปกติ

หมายเหตุ: ตรวจ `newPin` policy และ `newPin == oldPin` ก่อน query DB เพื่อไม่ให้นับ wrong attempt ในกรณีที่ input ไม่ถูกต้องอยู่แล้ว





