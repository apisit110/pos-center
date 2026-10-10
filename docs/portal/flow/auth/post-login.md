example description about this api endpoint

Method: POST
Path: /login

example request body:

```json
{
  "request": {
    "username": "",
    "pin": ""
  }
}
```

example response body:

```json
{
  "response": {
    "token": "",
    "user": {
      "id": "",
      "username": "",
      "email": "",
      "role": ""
    }
  }
}
```

Logic:

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
- Create a new JWT token contain uid, role, scope and expire in 30m
- return staff detail follow these uid, name, merchant_id
