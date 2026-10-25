this api use for push transactions (payment) from pos client (cashier) to pos center. Each transaction is processed one by one, transactions that are already synced are skipped (idempotent by transaction `uid`). The referenced order must be pushed first (see [push order](./push-order.md)).

**Method**: POST

**Path**: /api/v1/sync/push/transactions

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

| key                           | type   | required | description                                         |
| ----------------------------- | ------ | -------- | --------------------------------------------------- |
| transactions                  | array  | true     | list of transaction to push                         |
| transactions[].id             | string | true     | transaction id from pos client, min length 1        |
| transactions[].order_id       | string | true     | local order id from pos client, min length 1        |
| transactions[].merchant_id    | string | true     | merchant `partner_id`, min length 1                 |
| transactions[].store_id       | string | true     | store `sid`, min length 1                           |
| transactions[].terminal_id    | string | false    | terminal `tid`, nullable                            |
| transactions[].amount         | number | true     | transaction amount                                  |
| transactions[].received_amount | number | false   | cash received from customer, min 0, nullable (e.g. null for `QR_PROMPTPAY`) |
| transactions[].change_amount  | number | false    | change given back to customer, min 0, nullable      |
| transactions[].payment_method | string | true     | `CASH`, `QR_PROMPTPAY`                              |
| transactions[].status         | string | true     | `PENDING`, `APPROVED`, `FAILED`, `VOIDED`, `REFUNDED` |
| transactions[].staff_name     | string | true     | cashier staff name, min length 1                    |
| transactions[].created_at     | string | true     | transaction created date time, ISO 8601             |

example request body:

```json
{
  "transactions": [
    {
      "id": "string",
      "order_id": "ORD-0001",
      "merchant_id": "string",
      "store_id": "string",
      "terminal_id": "string",
      "amount": 125.5,
      "received_amount": 200,
      "change_amount": 74.5,
      "payment_method": "CASH",
      "status": "APPROVED",
      "staff_name": "string",
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

response body:

| key                           | type   | description                                                       |
| ----------------------------- | ------ | ----------------------------------------------------------------- |
| message                       | string | `Transaction sync process completed`                              |
| results                       | array  | result of each transaction, same order as request                 |
| results[].transactionId       | string | transaction uid (currently = `order_id` from request)             |
| results[].globalTransactionId | string | transaction id in pos center, empty string if `status` is `error` |
| results[].status              | string | `synced`, `already_synced`, `error`                               |
| syncState               | object | current versions, see [pull state](./pull-state.md); left out if the lookup failed (the push is still saved) |
| syncState.productVersion | number | max `map_store_product.sync_version` of the store |
| syncState.profileVersion | string | version of the cashier profile |

example response body:

```json
{
  "message": "Transaction sync process completed",
  "results": [
    {
      "transactionId": "ORD-0001",
      "globalTransactionId": "string",
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
| 403         | `{ "message": "Request does not match the token", "request_id": "string" }` | `merchant_id` / `store_id` / `terminal_id` of a transaction is not the one of the token |
| 500         | `{ "message": "Internal server error", "request_id": "string" }`     | unexpected error          |

Logic:

- Verify access token, see [authentication](./authentication.md) (401 `Invalid token` / `Token expired`)
- DTO Request
- Validate request body with zod schema
  - transactions
    - type: array
    - required: true
  - id, order_id, merchant_id, store_id, staff_name
    - type: string
    - min: 1
    - required: true
  - terminal_id
    - type: string
    - nullable: true
    - required: false
    - default: null
  - amount
    - type: number
    - required: true
  - received_amount, change_amount
    - type: number
    - min: 0
    - nullable: true
    - required: false
    - default: null
  - payment_method
    - type: enum (`CASH`, `QR_PROMPTPAY`)
    - required: true
  - status
    - type: enum (`PENDING`, `APPROVED`, `FAILED`, `VOIDED`, `REFUNDED`)
    - required: true
  - created_at
    - type: string
    - required: true
  - If validation fails, response http status 400 `Validation failed`
- Check scope of the body
  - check every transaction: `merchant_id` = `req.syncAuth.partnerId`, `store_id` = `req.syncAuth.sid`, `terminal_id` (when not null) = `req.syncAuth.tid`, if not, response http status 403 `Request does not match the token` (no transaction is synced)
- Map transaction uid = `order_id` (used as idempotency key)
- For each transaction in `transactions` (process one by one, error of one transaction does not stop other transactions)
  - Check idempotency
    - Find `transactions` by `uid` = transaction uid
    - if found, push result `already_synced` with `globalTransactionId` = `transactions.id` and skip to next transaction
  - Find merchant by `partner_id` = `merchant_id`
    - if not found, push result `error`
  - Find store by `sid` = `store_id` AND `merchant_id` = merchant id
    - if not found, push result `error`
  - Find order by `order_id` = `order_id` and `store_id` = store id
    - if not found, push result `error` (order must be pushed first)
  - if `terminal_id` is provided, find terminal by `tid` = `terminal_id`
    - if not found, save `terminal_id` as null
  - Insert `transactions` (uid, order_id = `order_id` (client order id), merchant_id = merchant id, store_id = store id, terminal_id = terminal id, amount, received_amount, change_amount, payment_method, status, staff_name, created_at), `id` is auto increment
  - push result `synced` with `globalTransactionId` = saved transaction id
  - if any error, log error and push result `error` with `globalTransactionId` = empty string
- Find sync state, see [pull state](./pull-state.md), of `req.syncAuth`
  - if it fails, log error and leave out `syncState`
- DTO Response
- response http status 200 with `message`, `results` and `syncState`
