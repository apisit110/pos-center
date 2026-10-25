this api use for list transactions with pagination and filter (used in transaction list page). Product Owner can see transactions of all merchants, other roles can see only transactions of their own merchant. Transactions are synced from pos (see `transactions` in [transaction-management](../../erdiagram/transaction-management.md)).

**Method**: GET

**Path**: /api/v1/transactions

**Permission**: `transactions:view`

request headers:

| key           | value            | required | description                                                                |
| ------------- | ---------------- | -------- | -------------------------------------------------------------------------- |
| Authorization | `Bearer <token>` | true     | access token from [login](../auth/post-login.md) (or cookie `token`)        |

request path:

none

request query:

| param          | type   | required | default | description                                                                                       |
| -------------- | ------ | -------- | ------- | ------------------------------------------------------------------------------------------------- |
| page           | number | false    | 1       | page number, integer, min 1                                                                       |
| limit          | number | false    | 10      | items per page, integer, min 1, max 100                                                           |
| transaction_id | string | false    |         | filter by transaction uid, partial match                                                          |
| order_id       | string | false    |         | filter by order id, partial match                                                                 |
| method         | string | false    |         | filter by payment method (exact match): `CASH`, `QR`                                      |
| status         | string | false    |         | filter by status (exact match): `PENDING`, `APPROVED`, `FAILED`, `VOIDED`, `REFUNDED`                             |
| start_date     | string | false    |         | filter transactions created on or after this date. `YYYY-MM-DD` = start of that day in `Asia/Bangkok` (00:00:00.000+07:00), or ISO 8601 date time with timezone = that exact instant |
| end_date       | string | false    |         | filter transactions created on or before this date. `YYYY-MM-DD` = end of that day in `Asia/Bangkok` (23:59:59.999+07:00), or ISO 8601 date time with timezone = that exact instant |

request body:

none

response body (fields below are the value of `data`, wrapped in [Ok](../../../apiresponse/middleware.md#ok)):

| key                    | type   | description                                                    |
| ---------------------- | ------ | -------------------------------------------------------------- |
| items                  | array  | list of transaction                                            |
| items[].uid            | string | transaction uid                                                |
| items[].order_id       | string | order id of the transaction, empty string if not linked        |
| items[].payment_method | string | `CASH`, `QR`                                           |
| items[].status         | string | `PENDING`, `APPROVED`, `FAILED`, `VOIDED`, `REFUNDED`                          |
| items[].amount         | number | transaction amount (4 decimal places max), 0 if not set        |
| items[].store_name_en  | string | store name (English), empty string if not found                |
| items[].store_name_th  | string | store name (Thai), empty string if not found                   |
| items[].staff_name     | string | cashier staff name of the transaction, empty string if not set  |
| items[].created_at     | string | created date time, ISO 8601                                    |
| total                  | number | total transactions matching the filter                         |
| page                   | number | current page                                                   |
| limit                  | number | items per page                                                 |

example response body:

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": {
    "items": [
      {
        "uid": "string",
        "order_id": "string",
        "payment_method": "QR",
        "status": "APPROVED",
        "amount": 125.5,
        "store_name_en": "string",
        "store_name_th": "string",
        "staff_name": "string",
        "created_at": "2026-01-01T00:00:00.000Z"
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
- Validate Permission `transactions:view` follow [uam](../../uam.md)
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
  - transaction_id, order_id
    - type: string
    - required: false
  - method
    - type: enum (`CASH`, `QR`)
    - required: false
  - status
    - type: enum (`PENDING`, `APPROVED`, `FAILED`, `VOIDED`, `REFUNDED`)
    - required: false
  - start_date, end_date
    - type: string, valid date
    - required: false
  - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
- Check role in access token
  - if role is not `PRODUCT_OWNER`
    - Find merchant uid of the staff by uid in access token
    - if not found, respond empty list (`items` = [], `total` = 0)
    - filter only transactions of that merchant (`transactions.merchant_id` = merchant id)
  - if role is `PRODUCT_OWNER`
    - no merchant filter
- Find transactions from database (left join `order` on `transactions.order_id` = `order.order_id` to get `order_id`, left join `store` on `transactions.store_id` to get `name_en`, `name_th`)
  - order by `created_at` descending, then `id` descending (newest first)
  - offset = `(page - 1) * limit`, limit = `limit`
  - if `transaction_id` is provided, filter transaction `uid` with LIKE `%transaction_id%`
  - if `order_id` is provided, filter order `order_id` with LIKE `%order_id%`
  - if `method` is provided, filter `payment_method` equal to `method`
  - if `status` is provided, filter `status` equal to `status`
  - if `start_date` is provided, filter `created_at` >= start of `start_date` (`Asia/Bangkok`, see [date and time](../../../specification.md))
  - if `end_date` is provided, filter `created_at` <= end of `end_date` at 23:59:59.999 (`Asia/Bangkok`, see [date and time](../../../specification.md))
  - all provided filters are combined with AND
- Count total transactions with the same filter and the same joins
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response transaction list follow these items (uid, order_id, payment_method, status, amount, store_name_en, store_name_th, staff_name, created_at), total, page, limit
  - `order_id`, `store_name_en`, `store_name_th` and `staff_name` are empty string if not found
