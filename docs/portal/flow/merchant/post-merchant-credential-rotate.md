this api use for rotate the `client_secret` of a merchant credential (used in merchant detail page, e.g. when the secret is lost or leaked). Only Product Owner can rotate. The `client_id` stays the same, a new `client_secret` is generated and returned only once in this response. The old secret stops working immediately.

**Method**: POST

**Path**: /api/v1/merchants/:id/credentials/rotate

**Permission**: `merchant_credentials:rotate`

request headers:

| key           | value              | required | description                                                          |
| ------------- | ------------------ | -------- | -------------------------------------------------------------------- |
| Authorization | `Bearer <token>`   | true     | access token from [login](../auth/post-login.md) (or cookie `token`) |
| Content-Type  | `application/json` | true     | request body format                                                  |

request path:

| param | type   | required | description  |
| ----- | ------ | -------- | ------------ |
| id    | string | true     | merchant uid |

request query:

none

request body:

| key      | type   | required | description                          |
| -------- | ------ | -------- | ------------------------------------ |
| provider | string | false    | `POS_CASHIER`, default `POS_CASHIER` |

example request body:

```json
{
  "provider": "POS_CASHIER"
}
```

response body (fields below are the value of `data`, wrapped in [Ok](../../../apiresponse/middleware.md#ok)):

| key           | type   | description                                                |
| ------------- | ------ | ---------------------------------------------------------- |
| merchant_uid  | string | merchant uid                                               |
| provider      | string | `POS_CASHIER`                                              |
| client_id     | string | client id (unchanged)                                      |
| client_secret | string | new client secret (**shown only in this response**)       |
| updated_at    | string | rotated date time (ISO 8601)                               |

example response body:

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": {
    "merchant_uid": "string",
    "provider": "POS_CASHIER",
    "client_id": "string",
    "client_secret": "string",
    "updated_at": "2026-10-22T10:00:00.000Z"
  }
}
```

Logic:

- Verify access token
  - if fail throw [ServiceError.ErrTokenInvalide](../../../apiresponse/ServiceError.ts)
- Check access token expire
  - throw [ServiceError.ErrTokenExpire](../../../apiresponse/ServiceError.ts)
- Validate Permission `merchant_credentials:rotate` follow [uam](../../uam.md)
  - throw [ServiceError.ErrPermissionDenied](../../../apiresponse/ServiceError.ts)
- DTO Request
- Validate request path with zod schema
  - id
    - type: string
    - min: 1
    - required: true
- Validate request body with zod schema
  - provider
    - type: enum `POS_CASHIER`
    - required: false
    - default: `POS_CASHIER`
  - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
- Find merchant by uid (path `id`)
  - if not found, throw [ServiceError.ErrMerchantNotFound](../../../apiresponse/ServiceError.ts)
- Find `merchant_credential` by merchant and `provider`
  - if not found, throw [ServiceError.ErrMerchantCredentialNotFound](../../../apiresponse/ServiceError.ts)
- Generate a new `client_secret` the same way as [create credential](post-merchant-credential.md) (`cs_` + 32 random bytes base64url)
- Hash it with SHA-256 (hex) and update `client_secret` of the credential (`client_id` is not changed)
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response `200 OK` with credential follow these items (merchant_uid, provider, client_id, client_secret (plain, only here), updated_at)
- do not write `client_secret` into any log, including the request logger
