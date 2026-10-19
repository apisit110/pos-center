this api use for get staff detail (used in staff detail page). Product Owner can see any staff, other roles can see only staff of their own merchant.

**Method**: GET

**Path**: /api/v1/staff/:id

**Permission**: `staff_detail:view`

request headers:

| key           | value            | required | description                                                                |
| ------------- | ---------------- | -------- | -------------------------------------------------------------------------- |
| Authorization | `Bearer <token>` | true     | access token from [login](../auth/post-login.md) (or cookie `token`)        |

request path:

| param | type   | required | description |
| ----- | ------ | -------- | ----------- |
| id    | string | true     | staff uid   |

request query:

none

request body:

none

response body (fields below are the value of `data`, wrapped in [Ok](../../../apiresponse/middleware.md#ok)):

| key           | type   | description                                                            |
| ------------- | ------ | ---------------------------------------------------------------------- |
| uid           | string | staff uid                                                              |
| merchant_uid  | string | uid of the merchant of the staff                                       |
| merchant_name | string | name of the merchant of the staff                                      |
| name          | string | staff name                                                             |
| role          | string | staff role (e.g. `manager`, `cashier`), `cashier` if staff has no role |
| username      | string | staff username, empty string if not set                                |
| status        | string | staff status: `ACTIVE`, `PENDING`, `INACTIVE`, `SUSPENDED`            |
| created_at    | string | created date time, ISO 8601                                            |

example response body:

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": {
    "uid": "string",
    "merchant_uid": "string",
    "merchant_name": "string",
    "name": "string",
    "role": "manager",
    "username": "string",
    "status": "ACTIVE",
    "created_at": "2026-01-01T00:00:00.000Z"
  }
}
```

Logic:

- Verify access token
  - if fail throw [ServiceError.ErrTokenInvalide](../../../apiresponse/ServiceError.ts)
- Check access token expire
  - throw [ServiceError.ErrTokenExpire](../../../apiresponse/ServiceError.ts)
- Validate Permission `staff_detail:view` follow [uam](../../uam.md)
  - throw [ServiceError.ErrPermissionDenied](../../../apiresponse/ServiceError.ts)
- DTO Request
- Validate request path with zod schema
  - id
    - type: string
    - min: 1
    - required: true
    - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
- Find staff by uid (path `id`) with merchant (`merchant_uid`, `merchant_name`) and role name
  - if not found, throw [ServiceError.ErrStaffNotFound](../../../apiresponse/ServiceError.ts)
- Check merchant ownership by role in access token
  - if role is `PRODUCT_OWNER`
    - allow any staff
  - if role is not `PRODUCT_OWNER`
    - Find merchant uid of the staff by uid in access token
    - if not found or not equal to `merchant_uid` of the staff, throw [ServiceError.ErrForbidden](../../../apiresponse/ServiceError.ts)
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response staff follow these items (uid, merchant_uid, merchant_name, name, role, username, status, created_at)
  - `role` is `cashier` if staff has no role
  - `username` is empty string if staff has no username
