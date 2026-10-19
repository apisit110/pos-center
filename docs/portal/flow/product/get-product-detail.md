this api use for get product detail (used in product detail page). Product Owner can see any product, other roles can see only products of their own merchant.

**Method**: GET

**Path**: /api/v1/products/:id

**Permission**: `product_detail:view`

request headers:

| key           | value            | required | description                                                                |
| ------------- | ---------------- | -------- | -------------------------------------------------------------------------- |
| Authorization | `Bearer <token>` | true     | access token from [login](../auth/post-login.md) (or cookie `token`)        |

request path:

| param | type   | required | description  |
| ----- | ------ | -------- | ------------ |
| id    | string | true     | product uid  |

request query:

none

request body:

none

response body (fields below are the value of `data`, wrapped in [Ok](../../../apiresponse/middleware.md#ok)):

| key          | type     | description                                       |
| ------------ | -------- | ------------------------------------------------- |
| uid          | string   | product uid                                       |
| merchant_uid | string   | uid of the merchant that owns the product         |
| mid          | string   | merchant id of the merchant that owns the product |
| name         | string   | product name                                      |
| sku          | string   | product sku, empty string if not set              |
| barcode      | string   | product barcode, empty string if not set          |
| base_price   | number   | base price (2 decimal places)                     |
| image_url    | string[] | list of image url, empty array if not set         |
| brand        | string   | brand name, empty string if not set               |
| unit_name    | string   | unit name, empty string if not set                |

example response body:

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": {
    "uid": "string",
    "merchant_uid": "string",
    "mid": "string",
    "name": "string",
    "sku": "string",
    "barcode": "string",
    "base_price": 25.5,
    "image_url": ["string"],
    "brand": "string",
    "unit_name": "string"
  }
}
```

Logic:

- Verify access token
  - if fail throw [ServiceError.ErrTokenInvalide](../../../apiresponse/ServiceError.ts)
- Check access token expire
  - throw [ServiceError.ErrTokenExpire](../../../apiresponse/ServiceError.ts)
- Validate Permission `product_detail:view` follow [uam](../../uam.md)
  - throw [ServiceError.ErrPermissionDenied](../../../apiresponse/ServiceError.ts)
- DTO Request
- Validate request path with zod schema
  - id
    - type: string
    - min: 1
    - required: true
    - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
- Find product by uid (path `id`) with its merchant (`merchant_uid`, `mid`)
  - if not found, throw [ServiceError.ErrProductNotFound](../../../apiresponse/ServiceError.ts)
- Check merchant ownership by role in access token
  - if role is `PRODUCT_OWNER`
    - allow any product
  - if role is not `PRODUCT_OWNER`
    - Find merchant uid of the staff by uid in access token
    - if not found or not equal to `merchant_uid` of the product, throw [ServiceError.ErrForbidden](../../../apiresponse/ServiceError.ts)
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response product follow these items (uid, merchant_uid, mid, name, sku, barcode, base_price, image_url, brand, unit_name)
