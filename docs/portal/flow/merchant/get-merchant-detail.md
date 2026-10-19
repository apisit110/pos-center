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

| key  | type   | description                               |
| ---- | ------ | ----------------------------------------- |
| uid  | string | merchant uid                              |
| mid  | string | merchant id (unique)                      |
| name | string | merchant name                             |

example response body:

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": {
    "uid": "string",
    "mid": "string",
    "name": "string"
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
- Find merchant by uid (path `id`)
  - if not found, throw [ServiceError.ErrMerchantNotFound](../../../apiresponse/ServiceError.ts)
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response merchant follow these items (uid, mid, name)
