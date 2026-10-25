this api use for pull products from pos center to pos client (cashier). Return only products of the store that changed after the client's last sync version (`map_store_product.sync_version` > `syncVersion`), so the client can sync incrementally.

**Method**: POST

**Path**: /api/v1/sync/pull/products

**Service**: pos-sync-service

request headers:

| key              | value              | required | description                                           |
| ---------------- | ------------------ | -------- | ----------------------------------------------------- |
| Content-Type     | `application/json` | true     |                                                       |
| Authorization    | `Bearer <access_token>` | true | access token, see [authentication](./authentication.md) |
| x-correlation-id | string             | false    | correlation id for log, generate uuid if not provided |

request path:

none

request query:

none

request body:

| key         | type   | required | description                                                         |
| ----------- | ------ | -------- | ------------------------------------------------------------------- |
| mid         | string | false    | deprecated, merchant `partner_id` (taken from the token), min 1     |
| sid         | string | false    | deprecated, store `sid` (taken from the token), min 1               |
| syncVersion | number | true     | last sync version known by the client, integer, min 0 (0 = pull all) |

example request body:

```json
{
  "syncVersion": 0
}
```

response body:

| key                    | type   | description                                                     |
| ---------------------- | ------ | --------------------------------------------------------------- |
| message                | string | `Sync completed successfully`                                   |
| products               | array  | list of product that changed after `syncVersion`                |
| products[].id          | string | product `uid`                                                   |
| products[].merchantId  | string | merchant `partner_id`                                           |
| products[].storeId     | string | store `sid`                                                     |
| products[].name        | string | product name (= `nameTh`)                                       |
| products[].nameEn      | string | product name (EN)                                               |
| products[].nameTh      | string | product name (TH)                                               |
| products[].sku         | string | sku, empty string if not set                                    |
| products[].barcode     | string | barcode, empty string if not set                                |
| products[].basePrice   | number | base price                                                      |
| products[].imageUrl    | string | image url, empty string if not set                              |
| products[].brand       | string | brand name (EN), empty string if not set                        |
| products[].syncVersion | number | `map_store_product.sync_version`, client keeps the max value as next `syncVersion` |
| count                  | number | number of products                                              |

example response body:

```json
{
  "message": "Sync completed successfully",
  "products": [
    {
      "id": "string",
      "merchantId": "string",
      "storeId": "string",
      "name": "string",
      "nameEn": "string",
      "nameTh": "string",
      "sku": "string",
      "barcode": "string",
      "basePrice": 125.5,
      "imageUrl": "string",
      "brand": "string",
      "syncVersion": 1
    }
  ],
  "count": 1
}
```

error response:

| http status | body                                                                                                          | description             |
| ----------- | ------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 400         | `{ "message": "Validation failed", "errors": [{ "path": [], "message": "string" }], "request_id": "string" }` | request body is invalid |
| 401         | `{ "message": "Invalid token", "request_id": "string" }` / `{ "message": "Token expired", ... }` | token is missing, invalid or expired, see [authentication](./authentication.md) |
| 403         | `{ "message": "Request does not match the token", "request_id": "string" }` | `mid` / `sid` is not the one of the token |
| 500         | `{ "message": "Sync failed" }`                                                                                | query products failed   |
| 500         | `{ "message": "Internal server error", "request_id": "string" }`                                              | unexpected error        |

Logic:

- Verify access token, see [authentication](./authentication.md) (401 `Invalid token` / `Token expired`)
- DTO Request
- Validate request body with zod schema
  - mid, sid (deprecated, taken from the token)
    - type: string
    - min: 1
    - required: false
  - syncVersion
    - type: number
    - integer: true
    - min: 0
    - required: true
  - If validation fails, response http status 400 `Validation failed`
- Check scope of the body
  - only when sent: check `mid` = `req.syncAuth.partnerId` AND `sid` = `req.syncAuth.sid`, if not, response http status 403 `Request does not match the token`
- Use `partnerId` = `req.syncAuth.partnerId` and `sid` = `req.syncAuth.sid`
- Find products from database
  - inner join `map_store_product` on `product.id` = `map_store_product.product_id`
  - inner join `merchant` on `product.merchant_id` = `merchant.id`
  - inner join `store` on `map_store_product.store_id` = `store.id`
  - left join `brand` on `product.brand_id` = `brand.id`
  - filter `merchant.partner_id` = `partnerId` AND `store.sid` = `sid` AND `map_store_product.sync_version` > `syncVersion`
  - if merchant or store not found, response empty list (`products` = [], `count` = 0)
  - if query fails, log error and response http status 500 `Sync failed`
- DTO Response
- response http status 200 with `message`, `products` and `count`
  - `sku`, `barcode`, `imageUrl` and `brand` are empty string if not set
  - `name` = `product.name_th`, `brand` = `brand.name_en`
  - `syncVersion` = `map_store_product.sync_version`
