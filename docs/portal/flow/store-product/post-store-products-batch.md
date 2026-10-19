this api use for add products to stores and set stock and price of each product in the store (used in import store product page). If the product is already in the store, its stock and price are updated.

The request is processed with partial success: a row that is invalid or cannot be saved is reported in `errors` and does not stop the other rows.

**Method**: POST

**Path**: /api/v1/store-products/batch

**Permission**: `store_products:create`

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

| key                    | type   | required | description                                                      |
| ---------------------- | ------ | -------- | ---------------------------------------------------------------- |
| mappings               | array  | true     | list of store product, max 1000 items                            |
| mappings[].store_uid   | string | true*    | store uid. *row without it is reported in `errors`               |
| mappings[].product_uid | string | true*    | product uid. *row without it is reported in `errors`             |
| mappings[].stock       | number | true*    | stock quantity, min 0 (coerce from string). *invalid row is reported in `errors` |
| mappings[].price       | number | true*    | selling price in the store, min 0 (coerce from string). *invalid row is reported in `errors` |

example request body:

```json
{
  "mappings": [
    {
      "store_uid": "string",
      "product_uid": "string",
      "stock": 100,
      "price": 25.5
    }
  ]
}
```

response body (fields below are the value of `data`, wrapped in [Ok](../../../apiresponse/middleware.md#ok)):

| key     | type     | description                                                                   |
| ------- | -------- | ----------------------------------------------------------------------------- |
| created | number   | number of product newly added to the store                                    |
| updated | number   | number of product already in the store that stock and price were updated      |
| errors  | string[] | reasons of the rows that cannot be saved, empty array if none                 |

error message format: `Row <n>: <reason>` (n starts at 1, follow the order in request `mappings`)

| reason                                                     | when                                              |
| ---------------------------------------------------------- | ------------------------------------------------- |
| `store_uid and product_uid are required`                   | `store_uid` or `product_uid` is missing or empty  |
| `stock must be a non-negative number`                      | `stock` is not a number or less than 0            |
| `price must be a non-negative number`                      | `price` is not a number or less than 0            |
| `store_uid "<store_uid>" not found`                        | store does not exist                              |
| `product_uid "<product_uid>" not found`                    | product does not exist                            |
| `forbidden`                                                | store or product belongs to another merchant      |

example response body:

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": {
    "created": 1,
    "updated": 1,
    "errors": ["Row 3: product_uid \"string\" not found"]
  }
}
```

Logic:

- Verify access token
  - if fail throw [ServiceError.ErrTokenInvalide](../../../apiresponse/ServiceError.ts)
- Check access token expire
  - throw [ServiceError.ErrTokenExpire](../../../apiresponse/ServiceError.ts)
- Validate Permission `store_products:create` follow [uam](../../uam.md)
  - throw [ServiceError.ErrPermissionDenied](../../../apiresponse/ServiceError.ts)
- DTO Request
- Validate request body with zod schema
  - mappings
    - type: array of object
    - max: 1000
    - required: true
    - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
  - the fields inside each mapping are validated per row in the next step (not throw), so a bad row does not fail the whole request
- Validate each row (index starts at 0, message uses `index + 1`)
  - `store_uid` and `product_uid` must not be empty
  - `stock` must be a finite number and >= 0
  - `price` must be a finite number and >= 0
  - invalid row is added to `errors` and skipped
- Check merchant ownership by role in access token
  - if role is `PRODUCT_OWNER`
    - allow any store and product
  - if role is not `PRODUCT_OWNER`
    - Find merchant uid of the staff by uid in access token
    - the store and the product of the row must belong to that merchant, if not add `Row <n>: forbidden` to `errors` and skip the row
- Process valid rows in chunks of 500 rows
  - Find stores by `store_uid` and products by `product_uid` (one query per chunk)
    - if store is not found, add `Row <n>: store_uid "<store_uid>" not found` to `errors`
    - if product is not found, add `Row <n>: product_uid "<product_uid>" not found` to `errors`
  - Find existing `store_product` by (store, product)
  - Save in one transaction
    - if `store_product` exists
      - update `stock`, `price`
      - update `unit` = `unit_name` of the product (keep old value if product has no `unit_name`)
      - increase `row_version` by 1 (so pos can sync the changed product)
      - updated += 1
    - if not exists
      - insert `store_product` with generated `uid` (uuid v4), `stock`, `price`, `unit` = `unit_name` of the product
      - created += 1
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response `201 Created` with follow these items (created, updated, errors)
