this api use for list terminals of a store (used in store detail page and merchant detail page, called once per store of the merchant). Product Owner can see terminals of any store, other roles can see only terminals of stores of their own merchant.

**Method**: GET

**Path**: /api/v1/stores/:id/terminals

**Permission**: `terminals:view`

request headers:

| key           | value            | required | description                                                                |
| ------------- | ---------------- | -------- | -------------------------------------------------------------------------- |
| Authorization | `Bearer <token>` | true     | access token from [login](../auth/post-login.md) (or cookie `token`)        |

request path:

| param | type   | required | description |
| ----- | ------ | -------- | ----------- |
| id    | string | true     | store uid   |

request query:

none

request body:

none

response body (fields below are the value of `data`, wrapped in [Ok](../../../apiresponse/middleware.md#ok)):

array of terminal (no pagination, no guaranteed order)

| key        | type   | description                       |
| ---------- | ------ | --------------------------------- |
| [].uid     | string | terminal uid                      |
| [].store_uid | string | uid of the store of the terminal |
| [].tid     | string | terminal id (e.g. used on the pos) |
| [].name_en | string | terminal name (English)           |
| [].name_th | string | terminal name (Thai)              |

example response body:

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": [
    {
      "uid": "string",
      "store_uid": "string",
      "tid": "string",
      "name_en": "string",
      "name_th": "string"
    }
  ]
}
```

Logic:

- Verify access token
  - if fail throw [ServiceError.ErrTokenInvalide](../../../apiresponse/ServiceError.ts)
- Check access token expire
  - throw [ServiceError.ErrTokenExpire](../../../apiresponse/ServiceError.ts)
- Validate Permission `terminals:view` follow [uam](../../uam.md)
  - throw [ServiceError.ErrPermissionDenied](../../../apiresponse/ServiceError.ts)
- DTO Request
- Validate request path with zod schema
  - id
    - type: string
    - min: 1
    - required: true
    - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
- Find store by uid (path `id`) with its merchant uid
  - if not found, respond empty array
- Check merchant ownership by role in access token
  - if role is `PRODUCT_OWNER`
    - allow any store
  - if role is not `PRODUCT_OWNER`
    - Find merchant uid of the staff by uid in access token
    - if not found or not equal to merchant uid of the store, throw [ServiceError.ErrForbidden](../../../apiresponse/ServiceError.ts)
- Find terminals of the store from database
  - join `map_store_terminal` (store_id, terminal_id) and `terminal`, filter by store of the path `id`
  - respond empty array if the store has no terminal
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response terminal list follow these items (uid, store_uid, tid, name_en, name_th)
