this api use for list merchant with pagination and filter by mid or name (English/Thai). Product Owner can see all merchants, other roles can see only their own merchant.

**Method**: GET

**Path**: /api/v1/merchants

**Permission**: `merchants:view`

request headers:

| key           | value            | required | description                                                                |
| ------------- | ---------------- | -------- | -------------------------------------------------------------------------- |
| Authorization | `Bearer <token>` | true     | access token from [login](../auth/post-login.md) (or cookie `token`)        |

request query:

| param | type   | required | default | description                                               |
| ----- | ------ | -------- | ------- | --------------------------------------------------------- |
| page  | number | false    | 1       | page number, integer, min 1                               |
| limit | number | false    | 10      | items per page, integer, min 1, max 100                   |
| mid   | string | false    |         | filter by merchant id, partial match (case-insensitive)   |
| name  | string | false    |         | filter by merchant `name_en` or `name_th`, partial match (case-insensitive) |

request body:

none

response body (fields below are the value of `data`, wrapped in [Ok](../../../apiresponse/middleware.md#ok)):

| key           | type   | description                                    |
| ------------- | ------ | ---------------------------------------------- |
| items         | array  | list of merchant                               |
| items[].uid        | string      | merchant uid                              |
| items[].partner_id | string      | partner id (unique)                       |
| items[].mid        | string/null | merchant id (unique, from `merchant_profile`, null if no profile) |
| items[].name_en    | string      | merchant name (English)                   |
| items[].name_th    | string      | merchant name (Thai)                      |
| total         | number | total merchants matching the filter            |
| page          | number | current page                                   |
| limit         | number | items per page                                 |

example response body:

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": {
    "items": [
      {
        "uid": "string",
        "partner_id": "string",
        "mid": "string",
        "name_en": "string",
        "name_th": "string"
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
- Validate Permission `merchants:view` follow [uam](../../uam.md)
  - throw [ServiceError.ErrPermissionDenied](../../../apiresponse/ServiceError.ts)
- DTO Request
- Validate request query with zod schema
  - page
    - type: number (coerce from string)
    - integer: true
    - min: 1
    - required: false
    - default: 1
    - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
  - limit
    - type: number (coerce from string)
    - integer: true
    - min: 1
    - max: 100
    - required: false
    - default: 10
    - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
  - mid
    - type: string
    - required: false
    - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
  - name
    - type: string
    - required: false
    - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
- Check role in access token
  - if role is not `PRODUCT_OWNER`
    - Find merchant uid of the staff by uid in access token
    - Find merchant (with `merchant_profile`) by that merchant uid
    - response only that merchant (ignore page, limit, mid, name)
      - `items` contains own merchant, or empty if not found
      - `total` = number of items, `page` = 1, `limit` = number of items
  - if role is `PRODUCT_OWNER`
    - Find merchants from database (`merchant` left join `merchant_profile` on `merchant_id`)
      - order by `id` ascending
      - offset = `(page - 1) * limit`
      - if `mid` is provided, filter `merchant_profile.mid` with ILIKE `%mid%`
      - if `name` is provided, filter `name_en` ILIKE `%name%` OR `name_th` ILIKE `%name%`
      - if both are provided, combine with AND
    - Count total merchants with the same filter
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response merchant list follow these items (uid, partner_id, mid, name_en, name_th), total, page, limit
