this api use for create many products at once (used in import product page, the portal reads products from a file and sends them in one request). Product Owner can create products for any merchant, other roles can create only for their own merchant.

The request is processed with partial success: a product that cannot be created (e.g. merchant not found) is reported in `errors` and does not stop the other products.

**Method**: POST

**Path**: /api/v1/products/batch

**Permission**: `products:create`

request headers:

| key           | value              | required | description                                                                |
| ------------- | ------------------ | -------- | -------------------------------------------------------------------------- |
| Authorization | `Bearer <token>`   | true     | access token from [login](../auth/post-login.md) (or cookie `token`)        |
| Content-Type  | `application/json` | true     | request body format (max body size 10 MB)                                  |

request path:

none

request query:

none

request body:

| key                      | type     | required | description                                                                                     |
| ------------------------ | -------- | -------- | ----------------------------------------------------------------------------------------------- |
| products                 | array    | true     | list of product, max 1000 items (can be empty, response `created` = 0)                          |
| products[].uid           | string   | false    | product uid. if not provided, it is generated. if the uid already exists, the product is updated |
| products[].merchant_uid  | string   | true     | merchant uid that owns the product, min length 1                                                |
| products[].name          | string   | true     | product name, min length 1                                                                      |
| products[].barcode       | string   | false    | product barcode. also used as `sku` (empty string if not provided)                              |
| products[].base_price    | number   | true     | base price, min 0 (coerce from string)                                                          |
| products[].image_url     | string[] | false    | list of image url, default `[]`                                                                 |
| products[].brand         | string   | false    | brand name, default empty string                                                                |
| products[].unit_name     | string   | false    | unit name, default empty string                                                                 |

example request body:

```json
{
  "products": [
    {
      "uid": "string",
      "merchant_uid": "string",
      "name": "string",
      "barcode": "string",
      "base_price": 25.5,
      "image_url": ["string"],
      "brand": "string",
      "unit_name": "string"
    }
  ]
}
```

response body (fields below are the value of `data`, wrapped in [Ok](../../../apiresponse/middleware.md#ok)):

| key                | type   | description                                                           |
| ------------------ | ------ | --------------------------------------------------------------------- |
| created            | number | number of products saved (inserted or updated)                        |
| errors             | array  | list of product that cannot be saved, empty array if none             |
| errors[].index     | number | index of the product in request `products` (start at 0)               |
| errors[].name      | string | product name                                                          |
| errors[].message   | string | reason                                                                |

example response body:

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": {
    "created": 1,
    "errors": [
      {
        "index": 1,
        "name": "string",
        "message": "Merchant not found: string"
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
- Validate Permission `products:create` follow [uam](../../uam.md)
  - throw [ServiceError.ErrPermissionDenied](../../../apiresponse/ServiceError.ts)
- DTO Request
- Validate request body with zod schema
  - products
    - type: array of object
    - max: 1000
    - required: true
  - products[].uid, products[].barcode, products[].brand, products[].unit_name
    - type: string
    - required: false
  - products[].merchant_uid
    - type: string
    - min: 1
    - required: true
  - products[].name
    - type: string
    - min: 1
    - required: true
  - products[].base_price
    - type: number (coerce from string)
    - min: 0
    - required: true
  - products[].image_url
    - type: array of string
    - required: false
  - If validation fails (any product), throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts) and nothing is saved
- Check merchant ownership by role in access token
  - if role is `PRODUCT_OWNER`
    - allow any `merchant_uid`
  - if role is not `PRODUCT_OWNER`
    - Find merchant uid of the staff by uid in access token
    - if not found or any product has `merchant_uid` not equal to it, throw [ServiceError.ErrForbidden](../../../apiresponse/ServiceError.ts) and nothing is saved
- if `products` is empty, respond `201 Created` with `{ "created": 0, "errors": [] }`
- Find each unique `merchant_uid` once
  - if a merchant is not found, add every product of that merchant to `errors` with message `Merchant not found: <merchant_uid>`, and skip those products
- Check `uid` of each valid product (only if `uid` is provided)
  - if the same `uid` already appears in an earlier product of the same request, add the product to `errors` with message `Duplicate uid: <uid>` and skip it
  - if a product with this `uid` already exists in database and it belongs to another merchant (not `merchant_uid` of the product), add the product to `errors` with message `Forbidden: uid belongs to another merchant` and skip it (nothing is updated)
- Check duplicate barcode of each valid product (only if `barcode` is not empty)
  - duplicate with another product of the same merchant in database (excluding the product with the same `uid`)
  - or duplicate with an earlier product of the same merchant in the same request
  - add the product to `errors` with message `Duplicate barcode: <barcode>` and skip it
- if there is no valid product left, respond `201 Created` with `created` = 0 and `errors`
- Normalize data of each valid product
  - `uid` = `uid` or generate uuid v4
  - `sku` = `barcode` or empty string
  - `barcode` = `barcode` or empty string
  - `image_url` = `[]`, `brand` = empty string, `unit_name` = empty string if not provided
- Save valid products in database, chunk of 500 products, each chunk in one transaction
  - upsert product by `uid` (insert, or update when `uid` already exists)
  - increase running number `product_version` by 1
  - update `row_version` of every `store_product` of the saved products to the new `product_version`
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response `201 Created` with follow these items (created, errors)
  - `created` = number of valid products saved
