this api use for get the select options of an address (province -> district -> sub district -> postal code), used in the address of the stores in create merchant page. Each level is loaded after its parent is selected.

The address master data is only used by the create merchant form, so these apis use its permission.

**Permission**: `merchants:create`

request headers (every api below):

| key           | value            | required | description                                                                |
| ------------- | ---------------- | -------- | -------------------------------------------------------------------------- |
| Authorization | `Bearer <token>` | true     | access token from [login](../auth/post-login.md) (or cookie `token`)        |

## Get provinces

**Method**: GET

**Path**: /api/v1/master-data/provinces

request query: none

## Get districts of a province

**Method**: GET

**Path**: /api/v1/master-data/districts

request query:

| param         | type   | required | description                    |
| ------------- | ------ | -------- | ------------------------------ |
| province_code | string | true     | `master_provinces.code`, min length 1 |

## Get sub districts of a district

**Method**: GET

**Path**: /api/v1/master-data/sub-districts

request query:

| param         | type   | required | description                    |
| ------------- | ------ | -------- | ------------------------------ |
| district_code | string | true     | `master_districts.code`, min length 1 |

## Get postal codes of a sub district

**Method**: GET

**Path**: /api/v1/master-data/postal-codes

request query:

| param             | type   | required | description                        |
| ----------------- | ------ | -------- | ---------------------------------- |
| sub_district_code | string | true     | `master_sub_districts.code`, min length 1 |

response body (fields below are the value of `data`, wrapped in [Ok](../../../apiresponse/middleware.md#ok)):

provinces, districts and sub districts: array of master data (no pagination, sorted by `name_th` ascending)

| key        | type   | description              |
| ---------- | ------ | ------------------------ |
| [].code    | string | code of the master data  |
| [].name_th | string | name (Thai)              |
| [].name_en | string | name (English)           |

postal codes: array (no pagination, sorted by `code` ascending)

| key     | type   | description       |
| ------- | ------ | ----------------- |
| [].code | string | `master_postal_code.code` |

example response body (provinces):

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": [
    { "code": "10", "name_th": "กรุงเทพมหานคร", "name_en": "Bangkok" }
  ]
}
```

example response body (postal codes):

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": [{ "code": "10200" }]
}
```

Logic:

- Verify access token
  - if fail throw [ServiceError.ErrTokenInvalide](../../../apiresponse/ServiceError.ts)
- Check access token expire
  - throw [ServiceError.ErrTokenExpire](../../../apiresponse/ServiceError.ts)
- Validate Permission `merchants:create` follow [uam](../../uam.md)
  - throw [ServiceError.ErrPermissionDenied](../../../apiresponse/ServiceError.ts)
- DTO Request
- Validate request query with zod schema (`province_code` / `district_code` / `sub_district_code`)
  - type: string
  - min: 1
  - required: true
  - If validation fails, throw [ValidationError.ErrInvalidRequest](../../../apiresponse/ValidationError.ts)
- Find master data from database
  - provinces: all `master_provinces`
  - districts: `master_districts` join `master_provinces` on `province_id`, filter `master_provinces.code` = `province_code`
  - sub districts: `master_sub_districts` join `master_districts` on `district_id`, filter `master_districts.code` = `district_code`
  - postal codes: `master_postal_code` join `master_sub_districts` on `sub_district_id`, filter `master_sub_districts.code` = `sub_district_code`
  - exclude rows without `code`
  - respond empty array if the parent code is not found
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), the response items below are `data`
- response follow these items (code, name_th, name_en), postal codes (code)
