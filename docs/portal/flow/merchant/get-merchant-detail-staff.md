this api use for list staff of a merchant (used in merchant detail page). Product Owner can see staff of any merchant, other roles can see only staff of their own merchant.

**Method**: GET

**Path**: /api/v1/merchants/:id/staff

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

array of staff (no pagination, max 500 items, no guaranteed order)

| key        | type   | description                                                   |
| ---------- | ------ | ------------------------------------------------------------- |
| [].uid      | string | staff uid                                                     |
| [].name     | string | staff name                                                    |
| [].role     | string | staff role (e.g. `manager`, `cashier`), default `cashier` if staff has no role |
| [].username | string | staff username, empty string if not set                       |
| [].status   | string | staff status: `ACTIVE`, `PENDING`, `INACTIVE`, `SUSPENDED`   |

example response body:

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": [
    {
      "uid": "string",
      "name": "string",
      "role": "manager",
      "username": "string",
      "status": "ACTIVE"
    }
  ]
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
- Find merchant by uid (path `id`)
  - if not found, throw [ServiceError.ErrMerchantNotFound](../../../apiresponse/ServiceError.ts)
- Find staff of the merchant from database
  - filter by merchant of the path `id`
  - join staff role to get role name (role is `cashier` if staff has no role)
  - limit 500 rows
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response staff list follow these items (uid, name, role, username, status)
  - `username` is empty string if staff has no username
