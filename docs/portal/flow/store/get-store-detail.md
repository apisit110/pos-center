this api use for get store detail (used in store detail page). Product Owner can see any store, other roles can see only stores of their own merchant.

**Method**: GET

**Path**: /api/v1/stores/:id

**Permission**: `store_detail:view`

request headers:

| key           | value            | required | description                                                                |
| ------------- | ---------------- | -------- | -------------------------------------------------------------------------- |
| Authorization | `Bearer <token>` | true     | access token from [login](../auth/post-login.md) (or cookie `token`)        |

request path:

| param | type   | required | description |
| ----- | ------ | -------- | ----------- |
| id    | string | true     | store uid   |

request query:

none

request body:

none

response body (fields below are the value of `data`, wrapped in [Ok](../../../apiresponse/middleware.md#ok)):

| key          | type   | description                                      |
| ------------ | ------ | ------------------------------------------------ |
| uid          | string | store uid                                        |
| sid          | string | store id (unique)                                |
| merchant_uid | string | uid of the merchant that owns the store          |
| mid          | string | merchant id of the merchant that owns the store  |
| name         | string | store name                                       |
| address      | string | store address, empty string if not set           |
| latitude     | number | latitude, 0 if not set                           |
| longitude    | number | longitude, 0 if not set                          |

example response body:

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": {
    "uid": "string",
    "sid": "string",
    "merchant_uid": "string",
    "mid": "string",
    "name": "string",
    "address": "string",
    "latitude": 13.7563,
    "longitude": 100.5018
  }
}
```

Logic:

- Verify access token
  - if fail throw [ServiceError.ErrTokenInvalide](../../../apiresponse/ServiceError.ts)
- Check access token expire
  - throw [ServiceError.ErrTokenExpire](../../../apiresponse/ServiceError.ts)
- Validate Permission `store_detail:view` follow [uam](../../uam.md)
  - throw [ServiceError.ErrPermissionDenied](../../../apiresponse/ServiceError.ts)
- DTO Request
- Validate request path with zod schema
  - id
    - type: string
    - min: 1
    - required: true
    - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
- Find store by uid (path `id`) with its merchant (`merchant_uid`, `mid`)
  - if not found, throw [ServiceError.ErrStoreNotFound](../../../apiresponse/ServiceError.ts)
- Check merchant ownership by role in access token
  - if role is `PRODUCT_OWNER`
    - allow any store
  - if role is not `PRODUCT_OWNER`
    - Find merchant uid of the staff by uid in access token
    - if not found or not equal to `merchant_uid` of the store, throw [ServiceError.ErrForbidden](../../../apiresponse/ServiceError.ts)
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response store follow these items (uid, sid, merchant_uid, mid, name, address, latitude, longitude)
  - `address` is empty string, `latitude` and `longitude` are 0 if not set
