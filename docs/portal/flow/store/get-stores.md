this api use for list stores (used in store list page and store select option). Product Owner can see stores of all merchants or filter by a merchant, other roles can see only stores of their own merchant.

**Method**: GET

**Path**: /api/v1/stores

**Permission**: `stores:view`

request headers:

| key           | value            | required | description                                                                |
| ------------- | ---------------- | -------- | -------------------------------------------------------------------------- |
| Authorization | `Bearer <token>` | true     | access token from [login](../auth/post-login.md) (or cookie `token`)        |

request path:

none

request query:

| param        | type   | required | default | description                                                         |
| ------------ | ------ | -------- | ------- | ------------------------------------------------------------------- |
| merchant_uid | string | false    |         | filter stores by merchant uid (exact match). Product Owner only, other roles are always limited to their own merchant |

request body:

none

response body (fields below are the value of `data`, wrapped in [Ok](../../../apiresponse/middleware.md#ok)):

array of store (no pagination, when filter by merchant max 500 items, no guaranteed order)

| key             | type   | description                                      |
| --------------- | ------ | ------------------------------------------------ |
| [].uid          | string | store uid                                        |
| [].sid          | string | store id (unique)                                |
| [].merchant_uid | string | uid of the merchant that owns the store          |
| [].partner_id   | string | partner id of the merchant                       |
| [].name_en | string | store name (English) |
| [].name_th | string | store name (Thai) |
| [].registered_address | object | registered address (type `REGISTERED`), null if not set |
| [].contract_address   | object | contract address (type `CONTRACT`), null if not set     |
| address object fields | | `address_1` (string, empty if not set), `province` / `district` / `sub_district` (`{ code, name_th, name_en }`), `postal_code` (string), `latitude` / `longitude` (number, null if not set) |

example response body:

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": [
    {
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
  ]
}
```

Logic:

- Verify access token
  - if fail throw [ServiceError.ErrTokenInvalide](../../../apiresponse/ServiceError.ts)
- Check access token expire
  - throw [ServiceError.ErrTokenExpire](../../../apiresponse/ServiceError.ts)
- Validate Permission `stores:view` follow [uam](../../uam.md)
  - throw [ServiceError.ErrPermissionDenied](../../../apiresponse/ServiceError.ts)
- DTO Request
- Validate request query with zod schema
  - merchant_uid
    - type: string
    - required: false
    - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
- Check merchant ownership by role in access token
  - if role is `PRODUCT_OWNER`
    - use `merchant_uid` from query as is (optional)
  - if role is not `PRODUCT_OWNER`
    - Find merchant uid of the staff by uid in access token
    - if not found, respond empty array
    - if `merchant_uid` is provided and not equal to own merchant uid, throw [ServiceError.ErrForbidden](../../../apiresponse/ServiceError.ts)
    - force `merchant_uid` to own merchant uid
- if `merchant_uid` is provided
  - Find merchant by uid
    - if not found, throw [ServiceError.ErrMerchantNotFound](../../../apiresponse/ServiceError.ts)
  - Find stores of the merchant from database (join merchant to get `merchant_uid` and `partner_id`, left join `map_store_address` -> `address` -> master data to get both addresses), limit 500 rows
- if `merchant_uid` is not provided (Product Owner only)
  - Find all stores from database (join merchant to get `merchant_uid` and `partner_id`, left join `map_store_address` -> `address` -> master data to get both addresses)
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response store list follow these items (uid, sid, merchant_uid, partner_id, name_en, name_th, registered_address, contract_address)
  - `registered_address` / `contract_address` are null if the store has no `map_store_address` of that type
