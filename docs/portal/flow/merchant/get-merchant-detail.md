this api use for get detail of a merchant (used in merchant detail page). Product Owner can see any merchant, other roles can see only their own merchant.

**Method**: GET

**Path**: /api/v1/merchants/:id

**Permission**: `merchant_detail:view`

request headers:

| key           | value            | required | description                                                                |
| ------------- | ---------------- | -------- | -------------------------------------------------------------------------- |
| Authorization | `Bearer <token>` | true     | access token from [login](../auth/post-login.md) (or cookie `token`)        |

request path:

| param | type   | required | description                                  |
| ----- | ------ | -------- | -------------------------------------------- |
| id    | string | true     | merchant uid                                 |

request query:

none

request body:

none

response body (fields below are the value of `data`, wrapped in [Ok](../../../apiresponse/middleware.md#ok)):

| key                       | type        | description                                                  |
| ------------------------- | ----------- | ------------------------------------------------------------ |
| uid                       | string      | merchant uid                                                 |
| partner_id                | string      | partner id (unique)                                          |
| name_en                   | string      | merchant name (English)                                      |
| name_th                   | string      | merchant name (Thai)                                         |
| created_at                | string      | created time (ISO 8601 UTC)                                  |
| updated_at                | string      | updated time (ISO 8601 UTC)                                  |
| credentials               | array       | credentials of the merchant, empty if none (`client_secret` is never returned, only its hash is stored) |
| credentials[].provider    | string      | `POS_CASHIER`                                                |
| credentials[].client_id   | string      | client id (unique)                                           |
| credentials[].created_at  | string      | created time (ISO 8601 UTC)                                  |
| credentials[].updated_at  | string      | updated time (last rotate, ISO 8601 UTC)                     |

example response body:

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": {
    "uid": "string",
    "partner_id": "string",
    "name_en": "string",
    "name_th": "string",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z",
    "credentials": [
      {
        "provider": "POS_CASHIER",
        "client_id": "string",
        "created_at": "2026-01-01T00:00:00.000Z",
        "updated_at": "2026-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

Logic:

- Verify access token
  - if fail throw [ServiceError.ErrTokenInvalide](../../../apiresponse/ServiceError.ts)
- Check access token expire
  - throw [ServiceError.ErrTokenExpire](../../../apiresponse/ServiceError.ts)
- Validate Permission `merchant_detail:view` follow [uam](../../uam.md)
  - throw [ServiceError.ErrPermissionDenied](../../../apiresponse/ServiceError.ts)
- DTO Request
- Validate request path with zod schema
  - id
    - type: string
    - min: 1
    - required: true
    - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
- Check merchant ownership by role in access token
  - if role is `PRODUCT_OWNER`
    - allow any merchant `id`
  - if role is not `PRODUCT_OWNER`
    - Find merchant uid of the staff by uid in access token
    - if not found or not equal to path `id`, throw [ServiceError.ErrForbidden](../../../apiresponse/ServiceError.ts)
- Find merchant by uid (path `id`) with `merchant_credential` (provider, client_id, created_at, updated_at only, never select `client_secret`)
  - if not found, throw [ServiceError.ErrMerchantNotFound](../../../apiresponse/ServiceError.ts)
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response merchant follow these items (uid, partner_id, name_en, name_th, created_at, updated_at, credentials)
