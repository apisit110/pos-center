this api use for get store detail (used in store detail page). Product Owner can see any store, other roles can see only stores of their own merchant.

**Method**: GET

**Path**: /api/v1/stores/:id

**Permission**: `store_detail:view`

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

| key          | type   | description                                      |
| ------------ | ------ | ------------------------------------------------ |
| uid          | string | store uid                                        |
| sid          | string | store id (unique)                                |
| merchant_uid | string | uid of the merchant that owns the store          |
| partner_id   | string | partner id of the merchant                       |
| name_en | string | store name (English) |
| name_th | string | store name (Thai) |
| registered_address | object | registered address (type `REGISTERED`), null if not set |
| contract_address   | object | contract address (type `CONTRACT`), null if not set     |
| address object fields | | `address_1` (string, empty if not set), `province` / `district` / `sub_district` (`{ code, name_th, name_en }`), `postal_code` (string), `latitude` / `longitude` (number, null if not set) |

example response body:

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": {
    "uid": "string",
    "sid": "string",
    "merchant_uid": "string",
    "partner_id": "string",
    "name_en": "string",
    "name_th": "string",
    "registered_address": {
      "address_1": "string",
      "province": { "code": "10", "name_th": "string", "name_en": "string" },
      "district": { "code": "1001", "name_th": "string", "name_en": "string" },
      "sub_district": { "code": "100101", "name_th": "string", "name_en": "string" },
      "postal_code": "10200",
      "latitude": 13.7563,
      "longitude": 100.5018
    },
    "contract_address": null
  }
}
```

Logic:

- Verify access token
  - if fail throw [ServiceError.ErrTokenInvalide](../../../apiresponse/ServiceError.ts)
- Check access token expire
  - throw [ServiceError.ErrTokenExpire](../../../apiresponse/ServiceError.ts)
- Validate Permission `store_detail:view` follow [uam](../../uam.md)
  - throw [ServiceError.ErrPermissionDenied](../../../apiresponse/ServiceError.ts)
- DTO Request
- Validate request path with zod schema
  - id
    - type: string
    - min: 1
    - required: true
    - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
- Find store by uid (path `id`) with its merchant (`merchant_uid`, `partner_id`) and its addresses (`map_store_address` -> `address` -> `master_provinces`, `master_districts`, `master_sub_districts`, `master_postal_code`)
  - if not found, throw [ServiceError.ErrStoreNotFound](../../../apiresponse/ServiceError.ts)
- Check merchant ownership by role in access token
  - if role is `PRODUCT_OWNER`
    - allow any store
  - if role is not `PRODUCT_OWNER`
    - Find merchant uid of the staff by uid in access token
    - if not found or not equal to `merchant_uid` of the store, throw [ServiceError.ErrForbidden](../../../apiresponse/ServiceError.ts)
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response store follow these items (uid, sid, merchant_uid, partner_id, name_en, name_th, registered_address, contract_address)
  - `registered_address` / `contract_address` are null if the store has no `map_store_address` of that type
