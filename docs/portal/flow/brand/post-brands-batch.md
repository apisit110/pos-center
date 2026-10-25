this api use for create many brands at once (used in import product page, the portal reads brands from sheet `brand` of the file and sends them before the products). If the brand uid already exists, its names are updated. Brands are shared by all merchants.

**Method**: POST

**Path**: /api/v1/brands/batch

**Permission**: `products:create` (brands are created by the product import)

request headers:

| key           | value              | required | description                                                                |
| ------------- | ------------------ | -------- | -------------------------------------------------------------------------- |
| Authorization | `Bearer <token>`   | true     | access token from [login](../auth/post-login.md) (or cookie `token`)        |
| Content-Type  | `application/json` | true     | request body format                                                        |

request path:

none

request query:

none

request body:

| key              | type   | required | description                                            |
| ---------------- | ------ | -------- | ------------------------------------------------------ |
| brands           | array  | true     | list of brand, max 1000 items (can be empty)           |
| brands[].uid     | string | true     | brand uid, trimmed, min length 1, max length 100       |
| brands[].name_en | string | true     | brand name (English), trimmed, min length 1, max length 255 |
| brands[].name_th | string | true     | brand name (Thai), trimmed, min length 1, max length 255    |

example request body:

```json
{
  "brands": [
    { "uid": "string", "name_en": "Coke", "name_th": "โค้ก" }
  ]
}
```

response body (fields below are the value of `data`, wrapped in [Ok](../../../apiresponse/middleware.md#ok)):

| key     | type   | description                                  |
| ------- | ------ | -------------------------------------------- |
| created | number | number of brands newly created               |
| updated | number | number of existing brands that names were updated |

example response body:

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": {
    "created": 1,
    "updated": 0
  }
}
```

Logic:

- Verify access token
  - if fail throw [ServiceError.ErrTokenInvalide](../../../apiresponse/ServiceError.ts)
- Check access token expire
  - throw [ServiceError.ErrTokenExpire](../../../apiresponse/ServiceError.ts)
- Validate Permission `products:create` follow [uam](../../uam.md)
  - throw [ServiceError.ErrPermissionDenied](../../../apiresponse/ServiceError.ts)
- DTO Request
- Validate request body with zod schema
  - brands
    - type: array of object (uid, name_en, name_th as above)
    - max: 1000
    - required: true
  - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts) and nothing is saved
- Check duplicate `uid` in the request
  - if found, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts), `details` = `brands.<index>.uid: duplicate uid <uid>`
- if `brands` is empty, respond `201 Created` with `{ "created": 0, "updated": 0 }`
- Save in one transaction
  - find existing `brand` by `uid` (to count `updated`)
  - upsert `brand` by `uid` (insert, or update `name_en`, `name_th` when `uid` already exists)
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response `201 Created` with follow these items (created, updated)
