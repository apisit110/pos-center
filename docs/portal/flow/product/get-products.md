this api use for list products with pagination and filter (used in product list page). Product Owner can see products of all merchants, other roles can see only products of their own merchant.

**Method**: GET

**Path**: /api/v1/products

**Permission**: `products:view`

request headers:

| key           | value            | required | description                                                                |
| ------------- | ---------------- | -------- | -------------------------------------------------------------------------- |
| Authorization | `Bearer <token>` | true     | access token from [login](../auth/post-login.md) (or cookie `token`)        |

request path:

none

request query:

| param        | type     | required | default | description                                                                                          |
| ------------ | -------- | -------- | ------- | ---------------------------------------------------------------------------------------------------- |
| page         | number   | false    | 1       | page number, integer, min 1                                                                          |
| limit        | number   | false    | 10      | items per page, integer, min 1, max 100                                                              |
| barcode      | string   | false    |         | filter by barcode, partial match (case-insensitive)                                                  |
| name         | string   | false    |         | filter by product `name_en` or `name_th`, partial match (case-insensitive)                           |
| merchant_uid | string   | false    |         | filter by merchant uid (exact match)                                                                 |
| brands       | string[] | false    | `[]`    | filter by brand uid, match any of the values. repeat the param: `brands=uid1&brands=uid2`            |
| units        | string[] | false    | `[]`    | filter by unit name, match any of the values. repeat the param: `units=pcs&units=box`                |
| price        | number   | false    |         | filter products with `base_price` less than or equal to this value, min 0                            |
| store_uid    | string   | false    |         | filter only products that are listed in this store (see [add products to store](../store-product/post-store-products-batch.md)) |

request body:

none

response body (fields below are the value of `data`, wrapped in [Ok](../../../apiresponse/middleware.md#ok)):

| key                  | type     | description                                                |
| -------------------- | -------- | ---------------------------------------------------------- |
| items                | array    | list of product                                            |
| items[].uid          | string   | product uid                                                |
| items[].merchant_uid | string   | uid of the merchant that owns the product                  |
| items[].partner_id   | string   | partner id of the merchant that owns the product           |
| items[].name_en      | string   | product name (English)                                     |
| items[].name_th      | string   | product name (Thai)                                        |
| items[].sku          | string   | product sku                                                |
| items[].barcode      | string   | product barcode, empty string if not set                   |
| items[].base_price   | number   | base price (max 4 decimal places)                          |
| items[].image_url    | string   | image url, empty string if not set                         |
| items[].brand        | object/null | brand `{ uid, name_en, name_th }`, null if not set      |
| items[].unit_name    | string   | unit name (e.g. `pcs`), empty string if not set            |
| total                | number   | total products matching the filter                         |
| page                 | number   | current page                                               |
| limit                | number   | items per page                                             |

example response body:

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": {
    "items": [
      {
        "uid": "string",
        "merchant_uid": "string",
        "partner_id": "string",
        "name_en": "string",
        "name_th": "string",
        "sku": "string",
        "barcode": "string",
        "base_price": 25.5,
        "image_url": "string",
        "brand": { "uid": "string", "name_en": "string", "name_th": "string" },
        "unit_name": "string"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
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
- Validate request query with zod schema
  - page
    - type: number (coerce from string)
    - integer: true
    - min: 1
    - required: false
    - default: 1
  - limit
    - type: number (coerce from string)
    - integer: true
    - min: 1
    - max: 100
    - required: false
    - default: 10
  - barcode, name, merchant_uid, store_uid
    - type: string
    - required: false
  - brands, units
    - type: array of string (a single value is converted to an array of one item)
    - required: false
    - default: []
  - price
    - type: number (coerce from string)
    - min: 0
    - required: false
  - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
- Check role in access token
  - if role is not `PRODUCT_OWNER`
    - Find merchant uid of the staff by uid in access token
    - if not found, respond empty list (`items` = [], `total` = 0)
    - if `merchant_uid` is provided and not equal to own merchant uid, throw [ServiceError.ErrForbidden](../../../apiresponse/ServiceError.ts)
    - force the `merchant_uid` filter to own merchant uid
  - if role is `PRODUCT_OWNER`
    - use `merchant_uid` from query as is (optional)
- Find products from database (join merchant to get `merchant_uid` and `partner_id`, left join `brand`)
  - order by `id` descending (newest first)
  - offset = `(page - 1) * limit`, limit = `limit`
  - if `barcode` is provided, filter `barcode` with ILIKE `%barcode%`
  - if `name` is provided, filter `name_en` ILIKE `%name%` OR `name_th` ILIKE `%name%`
  - if `merchant_uid` is provided, filter merchant `uid` equal to it
  - if `brands` is not empty, filter `brand.uid` IN `brands`
  - if `units` is not empty, filter `unit_name` IN `units`
  - if `price` is provided, filter `base_price` <= `price`
  - if `store_uid` is provided, join `map_store_product` and `store`, filter store `uid` equal to it
  - all provided filters are combined with AND
- Count total products with the same filter (`count(distinct product.id)`)
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response product list follow these items (uid, merchant_uid, partner_id, name_en, name_th, sku, barcode, base_price, image_url, brand, unit_name), total, page, limit
