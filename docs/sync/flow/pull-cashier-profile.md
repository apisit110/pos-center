this api use for pull the cashier profile from pos center to pos client (cashier) when the cashier is set up in online mode (cashier enters terminal id). The client first gets an access token from [issue sync token](./authentication.md#issue-sync-token) with `partner_id` + merchant credential (`POS_CASHIER`, created by [create merchant credential](../../portal/flow/merchant/post-merchant-credential.md)) and the terminal `tid`. The token tells the merchant, store and terminal. Response the merchant, store, terminal and staffs of the merchant.

**Method**: POST

**Path**: /api/v1/sync/pull/cashier-profile

**Service**: pos-sync-service

request headers:

| key              | value              | required | description                                           |
| ---------------- | ------------------ | -------- | ----------------------------------------------------- |
| Content-Type     | `application/json` | true     |                                                       |
| Authorization    | `Bearer <access_token>` | true | access token, see [authentication](./authentication.md) |
| x-correlation-id | string             | false    | correlation id for log, generate uuid if not provided |

request path:

none

request query:

none

request body:

none (the terminal is `tid` of the token)

response body:

| key                  | type   | description                                              |
| -------------------- | ------ | -------------------------------------------------------- |
| message              | string | `Sync completed successfully`                            |
| profile_version      | string | version of this profile, the client keeps it and compares with `profileVersion` of [pull state](./pull-state.md) |
| merchant             | object | merchant of the credential                               |
| merchant.uid         | string | merchant `uid`                                           |
| merchant.partner_id  | string | merchant `partner_id`                                    |
| merchant.name_en     | string | merchant name (EN)                                       |
| merchant.name_th     | string | merchant name (TH)                                       |
| store                | object | store that the terminal is mapped to                     |
| store.uid            | string | store `uid`                                              |
| store.sid            | string | store `sid`                                              |
| store.name_en        | string | store name (EN)                                          |
| store.name_th        | string | store name (TH)                                          |
| terminal             | object | terminal of `tid`                                        |
| terminal.uid         | string | terminal `uid`                                           |
| terminal.tid         | string | terminal `tid`                                           |
| terminal.name_en     | string | terminal name (EN)                                       |
| terminal.name_th     | string | terminal name (TH)                                       |
| staffs               | array  | list of cashier staff of the merchant                    |
| staffs[].uid         | string | staff `uid`                                              |
| staffs[].username    | string | staff `username`                                         |
| staffs[].full_name   | string | staff full name, empty string if not set                 |
| staffs[].status      | string | `PENDING`, `ACTIVE`, `SUSPENDED`, `INACTIVE`             |
| staffs[].roles       | array  | list of role name (`cashier_role.name`), empty array if none |
| staffs[].pin_hash    | string | `pin.pin_hash` of the staff (app `APP0001`), empty string if staff has no pin |
| staffs[].updated_at  | string | updated date time (ISO 8601)                             |

example response body:

```json
{
  "message": "Sync completed successfully",
  "profile_version": "8b06e33cda24719c5e0a5d417505821b",
  "merchant": {
    "uid": "string",
    "partner_id": "0001",
    "name_en": "string",
    "name_th": "string"
  },
  "store": {
    "uid": "string",
    "sid": "00010001",
    "name_en": "string",
    "name_th": "string"
  },
  "terminal": {
    "uid": "string",
    "tid": "0001000101",
    "name_en": "string",
    "name_th": "string"
  },
  "staffs": [
    {
      "uid": "string",
      "username": "00010001",
      "full_name": "string",
      "status": "ACTIVE",
      "roles": ["MANAGER"],
      "pin_hash": "string",
      "updated_at": "2026-10-25T10:00:00.000Z"
    }
  ]
}
```

error response:

| http status | body                                                                                                          | description                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 401         | `{ "message": "Invalid token", "request_id": "string" }` / `{ "message": "Token expired", ... }` | token is missing, invalid or expired, see [authentication](./authentication.md) |
| 404         | `{ "message": "Terminal not found", "request_id": "string" }`                                                 | terminal of the token not found, not mapped to a store, or not of the merchant any more |
| 500         | `{ "message": "Internal server error", "request_id": "string" }`                                              | unexpected error                                                  |

Logic:

- Verify access token, see [authentication](./authentication.md) (401 `Invalid token` / `Token expired`), the terminal is `req.syncAuth`
- Find profile version, see [pull state](./pull-state.md)
  - before reading the profile, so a change in between makes the client pull again, never miss it
- Find merchant
  - find `merchant` by `partner_id` = `req.syncAuth.partnerId`
- Find terminal and store
  - find `terminal` by `tid` = `req.syncAuth.tid`
    - inner join `map_store_terminal` on `terminal.id` = `map_store_terminal.terminal_id`
    - inner join `store` on `map_store_terminal.store_id` = `store.id`
  - check `store.merchant_id` = `merchant.id`
  - if merchant or terminal not found, not mapped to a store, or store is not of the merchant (the terminal can change after the token is issued), response http status 404 `Terminal not found`
- Find staffs of the merchant
  - find `cashier_staff` by `merchant_id` = `merchant.id`
    - left join `cashier_staff_role` on `cashier_staff.id` = `cashier_staff_role.staff_id`
    - left join `cashier_role` on `cashier_staff_role.role_id` = `cashier_role.id`
  - return staffs of every status, the client uses `status` to allow or block login
  - group roles by staff
- Find pin of the staffs
  - find `pin` by `app_id` = `APP0001` AND `username` in staffs `username`
  - map `pin_hash` to staff by `username`, the client uses `pin_hash` to verify pin when offline
- DTO Response
- response http status 200 with `message`, `profile_version`, `merchant`, `store`, `terminal` and `staffs`
  - `full_name` is empty string if not set
  - `roles` is empty array if staff has no role
  - `pin_hash` is empty string if staff has no pin
- do not write `authorization` and `pin_hash` into any log, including the request logger
  - the request logger logs request headers and response body, so `authorization` and `pin_hash` are in `SENSITIVE_KEYS` in `LoggerMiddleware`
