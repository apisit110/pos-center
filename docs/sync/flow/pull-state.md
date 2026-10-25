this api use for check if the client needs to pull, before [pull products](./pull-products.md) and [pull cashier profile](./pull-cashier-profile.md). It returns only the current version of each, so it is cheap enough to call on every login and after every sale. The same versions are also returned as `syncState` in the response of [push order](./push-order.md), [push transaction](./push-transaction.md) and [push products](./push-products.md), so after a push the client does not need to call this api.

**Method**: POST

**Path**: /api/v1/sync/pull/state

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

none (merchant, store and terminal are of the token)

response body:

| key            | type   | description                                                                                              |
| -------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| message        | string | `Sync completed successfully`                                                                            |
| productVersion | number | max `map_store_product.sync_version` of the store, 0 if the store has no products                        |
| profileVersion | string | version of the cashier profile (md5 fingerprint), compare with `profile_version` of pull cashier profile |

example response body:

```json
{
  "message": "Sync completed successfully",
  "productVersion": 40,
  "profileVersion": "8b06e33cda24719c5e0a5d417505821b"
}
```

error response:

| http status | body                                                                                             | description                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| 401         | `{ "message": "Invalid token", "request_id": "string" }` / `{ "message": "Token expired", ... }` | token is missing, invalid or expired, see [authentication](./authentication.md) |
| 500         | `{ "message": "Internal server error", "request_id": "string" }`                                 | unexpected error                                                                 |

Client usage:

- keep `syncVersion` (max `syncVersion` of pulled products) and `profile_version` (of the last pull cashier profile)
- on login, and after a sale (debounce, one pull at a time), call this api or read `syncState` of the push response
  - `productVersion` > `syncVersion` -> [pull products](./pull-products.md) with `syncVersion`
  - `profileVersion` != `profile_version` -> [pull cashier profile](./pull-cashier-profile.md)
  - otherwise nothing to pull
- do not block login or checkout while pulling, use the local data

Logic:

- Verify access token, see [authentication](./authentication.md) (401 `Invalid token` / `Token expired`), use `partnerId`, `sid`, `tid` of `req.syncAuth`
- Find product version (in parallel with profile version)
  - `coalesce(max(map_store_product.sync_version), 0)`
    - inner join `store` on `map_store_product.store_id` = `store.id`
    - inner join `merchant` on `store.merchant_id` = `merchant.id`
    - filter `merchant.partner_id` = `partnerId` AND `store.sid` = `sid`
- Find profile version
  - one query over the data of [pull cashier profile](./pull-cashier-profile.md), `md5` of these values joined with `|`
    - `merchant.updated_at` of `partner_id` = `partnerId`
    - `terminal.updated_at`, `map_store_terminal.updated_at`, `store.id`, `store.updated_at` of `tid` = `tid`
    - count and max `updated_at` of `cashier_staff` of the merchant
    - count and max `updated_at` of `cashier_staff_role` of the staffs, max `cashier_role.updated_at` of the roles
    - count and max `updated_at` of `pin` of `app_id` = `APP0001` AND `username` in the staffs `username`
  - count changes on delete, max `updated_at` changes on insert / update, so any change of the profile changes the version
  - it may also change when nothing of the profile changed (e.g. `pin_failed_attempts`, merchant credential), then the client pulls once more, it never misses a change
  - merchant or terminal not found is not an error here, pull cashier profile responses 404
- DTO Response
- response http status 200 with `message`, `productVersion` and `profileVersion`
