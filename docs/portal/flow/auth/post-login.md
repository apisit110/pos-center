this api use for login with username + pin. if success will response staff detail and access token to client.

Method: POST
Path: /api/v1/auth/login

example request body:

```json
{
  "username": "string",
  "pin": "string"
}
```

example response body:

```json
{
  "token": "string",
  "user": {
    "uid": "string",
    "name": "string",
    "merchant_id": "string"
  }
}
```

Logic:

- DTO Request
- Validate request payload with zod schema
  - username
    - type: string
    - min length: 1
    - max length: 255
    - required: true
    - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
  - pin
    - type: string
    - min length: 6
    - max length: 6
    - required: true
    - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
- Check If user does not exist in the database by username
  - throw [ServiceError.ErrIncorrectUsernameOrPin](../../../apiresponse/ServiceError.ts)
- Check if user status is PENDING
  - throw [ServiceError.ErrUserPending](../../../apiresponse/ServiceError.ts)
- Check if user status is INACTIVE
  - throw [ServiceError.ErrUserInactive](../../../apiresponse/ServiceError.ts)
- Check if user status is SUSPENDED
  - throw [ServiceError.ErrUserSuspended](../../../apiresponse/ServiceError.ts)
- Check if user by app_id, username and pin is correct with [verifyPin](../../../repositories/pin-repository.md)
  - If correct, return token and user info
  - If incorrect, in case of pin not found, throw [ServiceError.ErrIncorrectUsernameOrPin](../../../apiresponse/ServiceError.ts)
  - If incorrect, in case of pin is locked, throw [ServiceError.ErrPinLocked](../../../apiresponse/ServiceError.ts)
  - If incorrect, in case of wrong pin, throw [ServiceError.ErrIncorrectUsernameOrPin](../../../apiresponse/ServiceError.ts)
- Create a new JWT token contain uid, role, scope follow [uam](../../uam.md) and expire in 30m
- DTO Response
- response staff detail follow these uid, name, merchant_id
- response token in cookie
  - set secure = true if NODE_ENV === 'production'
  
