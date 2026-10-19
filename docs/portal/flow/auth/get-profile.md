this api use for get profile using jwt token

Method: GET
Path: /api/v1/auth/me

example request headers:

```json
Authorization: Bearer <token>
```

example request body:

```json
```

example response body:

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": {
    "user": {
      "uid": "string",
      "name": "string",
      "merchant_id": "string"
    }
  }
}
```

Logic:

- Verify access token
  - if fail throw [ServiceError.ErrTokenInvalide](../../../apiresponse/ServiceError.ts)
- Check access token expire
  - throw [ServiceError.ErrTokenExpire](../../../apiresponse/ServiceError.ts)
- Validate Permission
  - throw [ServiceError.ErrPermissionDenied](../../../apiresponse/ServiceError.ts)
- Validate request payload with zod schema
  - if validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
- Check Profile by uid
- Find staff detail by uid in access token
  - if not found staff throw throw [ServiceError.ErrStaffNotFound](../../../apiresponse/ServiceError.ts)
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response staff detail follow these uid, name, merchant_id
