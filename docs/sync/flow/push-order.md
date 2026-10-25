this api use for push orders from pos client (cashier) to pos center. Each order is processed one by one, orders that are already synced are skipped (idempotent by `order_id` + `store_id`, see `order_sync_logs`). The order must be pushed before its transaction (see [push transaction](./push-transaction.md)).

**Method**: POST

**Path**: /api/v1/sync/push/orders

**Service**: pos-sync-service

request headers:

| key              | value              | required | description                                         |
| ---------------- | ------------------ | -------- | --------------------------------------------------- |
| Content-Type     | `application/json` | true     |                                                     |
| Authorization    | `Bearer <access_token>` | true | access token, see [authentication](./authentication.md) |
| x-correlation-id | string             | false    | correlation id for log, generate uuid if not provided |

request path:

none

request query:

none

request body:

| key                      | type   | required | description                                                   |
| ------------------------ | ------ | -------- | ------------------------------------------------------------- |
| orders                   | array  | true     | list of order to push                                         |
| orders[].order_id        | string | true     | local order id from pos client, min length 1                  |
| orders[].merchant_id     | string | true     | merchant `partner_id`, min length 1                           |
| orders[].store_id        | string | true     | store `sid`, min length 1                                     |
| orders[].terminal_id     | string | false    | terminal `tid`, nullable in validation but the order fails without it |
| orders[].staff_id        | string | true     | cashier staff `username`, min length 1                        |
| orders[].member_id       | string | false    | member `phone_no`, nullable                                   |
| orders[].total_amount    | number | true     | total amount of the order                                     |
| orders[].status          | string | true     | `PENDING`, `PAID`, `CANCELLED` (stored as `VOID`), `VOID`, `REFUNDED` |
| orders[].items           | array  | true     | list of order item                                            |
| orders[].items[].product_id | string | true  | product `uid`, min length 1                                   |
| orders[].items[].quantity   | number | true  | quantity, integer                                             |
| orders[].items[].price      | number | true  | price per unit                                                |
| orders[].created_at      | string | true     | order created date time, ISO 8601                             |

example request body:

```json
{
  "orders": [
    {
      "order_id": "ORD-0001",
      "merchant_id": "string",
      "store_id": "string",
      "terminal_id": "string",
      "staff_id": "string",
      "member_id": null,
      "total_amount": 125.5,
      "status": "PAID",
      "items": [
        {
          "product_id": "string",
          "quantity": 1,
          "price": 125.5
        }
      ],
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

response body:

| key                     | type   | description                                                   |
| ----------------------- | ------ | ------------------------------------------------------------- |
| message                 | string | `Order sync process completed`                                |
| results                 | array  | result of each order, same order as request                   |
| results[].orderId       | string | local order id from request                                   |
| results[].globalOrderId | string | order id in pos center, empty string if `status` is `error`   |
| results[].status        | string | `synced`, `already_synced`, `error`                           |
| syncState               | object | current versions, see [pull state](./pull-state.md); left out if the lookup failed (the push is still saved) |
| syncState.productVersion | number | max `map_store_product.sync_version` of the store |
| syncState.profileVersion | string | version of the cashier profile |

example response body:

```json
{
  "message": "Order sync process completed",
  "results": [
    {
      "orderId": "ORD-0001",
      "globalOrderId": "1",
      "status": "synced"
    }
  ],
  "syncState": {
    "productVersion": 40,
    "profileVersion": "8b06e33cda24719c5e0a5d417505821b"
  }
}
```

error response:

| http status | body                                                                 | description               |
| ----------- | -------------------------------------------------------------------- | ------------------------- |
| 400         | `{ "message": "Validation failed", "errors": [{ "path": [], "message": "string" }], "request_id": "string" }` | request body is invalid |
| 401         | `{ "message": "Invalid token", "request_id": "string" }` / `{ "message": "Token expired", ... }` | token is missing, invalid or expired, see [authentication](./authentication.md) |
| 403         | `{ "message": "Request does not match the token", "request_id": "string" }` | `merchant_id` / `store_id` / `terminal_id` of an order is not the one of the token |
| 500         | `{ "message": "Internal server error", "request_id": "string" }`     | unexpected error          |

Logic:

- Verify access token, see [authentication](./authentication.md) (401 `Invalid token` / `Token expired`)
- DTO Request
- Validate request body with zod schema
  - orders
    - type: array
    - required: true
  - order_id, merchant_id, store_id, staff_id
    - type: string
    - min: 1
    - required: true
  - terminal_id, member_id
    - type: string
    - nullable: true
    - required: false
    - default: null
  - total_amount
    - type: number
    - required: true
  - status
    - type: enum (`PENDING`, `PAID`, `CANCELLED`, `VOID`, `REFUNDED`)
    - required: true
  - items
    - type: array
    - required: true
    - product_id
      - type: string
      - min: 1
      - required: true
    - quantity
      - type: number
      - integer: true
      - required: true
    - price
      - type: number
      - required: true
  - created_at
    - type: string
    - required: true
  - If validation fails, response http status 400 `Validation failed`
- Check scope of the body
  - check every order: `merchant_id` = `req.syncAuth.partnerId`, `store_id` = `req.syncAuth.sid`, `terminal_id` (when not null) = `req.syncAuth.tid`, if not, response http status 403 `Request does not match the token` (no order is synced)
- For each order in `orders` (process one by one, error of one order does not stop other orders)
  - Check idempotency
    - Find store by `sid` = `store_id`
    - Find `order_sync_logs` by `pos_temp_id` = `order_id` and `store_id` = store id
    - if found, push result `already_synced` with `globalOrderId` = `order_sync_logs.global_order_id` and skip to next order
  - Find merchant by `partner_id` = `merchant_id`
    - if not found, push result `error`
  - Find store by `sid` = `store_id` AND `merchant_id` = merchant id
    - if not found, push result `error`
  - Find terminal by `tid` = `terminal_id` (`order.terminal_id` is NOT NULL)
    - if `terminal_id` is not provided or not found, push result `error`
  - Find cashier staff by `username` = `staff_id` AND `merchant_id` = merchant id
    - if not found, push result `error`
  - if `member_id` is provided, find member by `phone_no` = `member_id`
    - if not found, save `member_id` as null
  - Save order in database transaction
    - insert `order` (order_id, merchant_id, store_id, terminal_id, cashier_staff_id, member_id, total_amount, status, is_synced = false, created_at)
      - status `CANCELLED` is saved as `VOID`
    - if `items` is not empty
      - find product by `uid` = `items[].product_id`
        - if not found, rollback and push result `error`
      - insert `order_items` (order_id, product_id, quantity, price)
  - Create `order_sync_logs` (pos_temp_id = `order_id`, store_id = store id, global_order_id = saved order id, synced_at = now)
  - push result `synced` with `globalOrderId` = saved order id
  - if any error, log error and push result `error` with `globalOrderId` = empty string
- Find sync state, see [pull state](./pull-state.md), of `req.syncAuth`
  - if it fails, log error and leave out `syncState`
- DTO Response
- response http status 200 with `message`, `results` and `syncState`
