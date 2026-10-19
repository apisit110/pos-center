this api use for list staff with pagination and filter (used in staff list page). Product Owner can see staff of all merchants, other roles can see only staff of their own merchant.

To list staff of one merchant in the merchant detail page, use [get merchant detail staff](../merchant/get-merchant-detail-staff.md).

**Method**: GET

**Path**: /api/v1/staff

**Permission**: `staffs:view`

request headers:

| key           | value            | required | description                                                                |
| ------------- | ---------------- | -------- | -------------------------------------------------------------------------- |
| Authorization | `Bearer <token>` | true     | access token from [login](../auth/post-login.md) (or cookie `token`)        |

request path:

none

request query:

| param        | type   | required | default | description                                                                                           |
| ------------ | ------ | -------- | ------- | ----------------------------------------------------------------------------------------------------- |
| page         | number | false    | 1       | page number, integer, min 1                                                                           |
| limit        | number | false    | 10      | items per page, integer, min 1, max 100                                                               |
| merchant_uid | string | false    |         | filter by merchant uid (exact match)                                                                  |
| role         | string | false    |         | filter by role name (exact match, e.g. `manager`, `cashier`)                                          |
| username     | string | false    |         | filter by username, partial match                                                                     |
| status       | string | false    |         | filter by status (exact match): `ACTIVE`, `PENDING`, `INACTIVE`, `SUSPENDED`                          |
| query        | string | false    |         | search by staff name, partial match                                                                   |
| start_date   | string | false    |         | filter staff created on or after this date. `YYYY-MM-DD` = start of that day in `Asia/Bangkok` (00:00:00.000+07:00), or ISO 8601 date time with timezone = that exact instant |
| end_date     | string | false    |         | filter staff created on or before this date. `YYYY-MM-DD` = end of that day in `Asia/Bangkok` (23:59:59.999+07:00), or ISO 8601 date time with timezone = that exact instant |

request body:

none

response body (fields below are the value of `data`, wrapped in [Ok](../../../apiresponse/middleware.md#ok)):

| key                   | type   | description                                                            |
| --------------------- | ------ | ---------------------------------------------------------------------- |
| items                 | array  | list of staff                                                          |
| items[].uid           | string | staff uid                                                              |
| items[].merchant_uid  | string | uid of the merchant of the staff                                       |
| items[].merchant_name | string | name of the merchant of the staff                                      |
| items[].name          | string | staff name                                                             |
| items[].role          | string | staff role (e.g. `manager`, `cashier`), `cashier` if staff has no role |
| items[].username      | string | staff username, empty string if not set                                |
| items[].status        | string | staff status: `ACTIVE`, `PENDING`, `INACTIVE`, `SUSPENDED`            |
| items[].created_at    | string | created date time, ISO 8601                                            |
| total                 | number | total staff matching the filter                                        |
| page                  | number | current page                                                           |
| limit                 | number | items per page                                                         |

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
        "merchant_name": "string",
        "name": "string",
        "role": "manager",
        "username": "string",
        "status": "ACTIVE",
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
- Validate Permission `staffs:view` follow [uam](../../uam.md)
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
  - merchant_uid, role, username, query
    - type: string
    - required: false
  - status
    - type: enum (`ACTIVE`, `PENDING`, `INACTIVE`, `SUSPENDED`)
    - required: false
  - start_date, end_date
    - type: string, valid date
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
- if `merchant_uid` is provided, find merchant by uid
  - if not found, respond empty list (`items` = [], `total` = 0, `page`, `limit`), do not ignore the filter
- Find staff from database (join merchant to get `merchant_uid`, `merchant_name`, left join staff role to get role name)
  - order by `id` descending (newest first)
  - offset = `(page - 1) * limit`, limit = `limit`
  - if `merchant_uid` is provided, filter staff of that merchant
  - if `role` is provided, filter role name equal to `role`
  - if `username` is provided, filter `username` with LIKE `%username%`
  - if `status` is provided, filter `status` equal to `status`
  - if `query` is provided, filter `name` with LIKE `%query%`
  - if `start_date` is provided, filter `created_at` >= start of `start_date` (`Asia/Bangkok`, see [date and time](../../../specification.md))
  - if `end_date` is provided, filter `created_at` <= end of `end_date` at 23:59:59.999 (`Asia/Bangkok`, see [date and time](../../../specification.md))
  - all provided filters are combined with AND
- Count total staff with the same filter
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response staff list follow these items (uid, merchant_uid, merchant_name, name, role, username, status, created_at), total, page, limit
  - `role` is `cashier` if staff has no role
  - `username` is empty string if staff has no username
