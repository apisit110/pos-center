this api use for get select option values of the product filter (brand and unit) used in product list page. Product Owner gets values from all products, other roles get values only from products of their own merchant.

**Method**: GET

**Path**: /api/v1/products/metadata

**Permission**: `products:view`

request headers:

| key           | value            | required | description                                                                |
| ------------- | ---------------- | -------- | -------------------------------------------------------------------------- |
| Authorization | `Bearer <token>` | true     | access token from [login](../auth/post-login.md) (or cookie `token`)        |

request path:

none

request query:

none

request body:

none

response body (fields below are the value of `data`, wrapped in [Ok](../../../apiresponse/middleware.md#ok)):

| key    | type     | description                                                       |
| ------ | -------- | ----------------------------------------------------------------- |
| brands | string[] | distinct brand names, sorted ascending, empty values are excluded |
| units  | string[] | distinct unit names, sorted ascending, empty values are excluded  |

example response body:

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": {
    "brands": ["string"],
    "units": ["string"]
  }
}
```

Logic:

- Verify access token
  - if fail throw [ServiceError.ErrTokenInvalide](../../../apiresponse/ServiceError.ts)
- Check access token expire
  - throw [ServiceError.ErrTokenExpire](../../../apiresponse/ServiceError.ts)
- Validate Permission `products:view` follow [uam](../../uam.md)
  - throw [ServiceError.ErrPermissionDenied](../../../apiresponse/ServiceError.ts)
- DTO Request
- Validate request with zod schema
  - no path, query or body to validate
- Check role in access token
  - if role is not `PRODUCT_OWNER`
    - Find merchant uid of the staff by uid in access token
    - if not found, respond `{ "brands": [], "units": [] }`
    - only products of that merchant are used in the next step
  - if role is `PRODUCT_OWNER`
    - use products of all merchants
- Find distinct `brand` and distinct `unit_name` from products in database
  - exclude null and empty string
  - order ascending
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response follow these items (brands, units)

The values are used as the options of `brands` and `units` query in [get products](get-products.md).
