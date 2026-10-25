every api of pos-sync-service (`/api/v1/sync/*`) requires an access token. The pos client (cashier) gets the token from [issue sync token](#issue-sync-token) with `partner_id` + merchant credential (`client_id` / `client_secret` of provider `POS_CASHIER`, created by [create merchant credential](../../portal/flow/merchant/post-merchant-credential.md)) and the terminal `tid`. The token is of one terminal: the client can sync only the data of the merchant, store and terminal of the token.

```
1) POST /api/v1/sync/auth/token      x-partner-id / x-client-id / x-client-secret + { tid }
   -> { access_token, token_type: "Bearer", expires_in: 3600 }
2) every other sync api              Authorization: Bearer <access_token>
3) 401 "Token expired"               -> request a new token (step 1) and retry
```

The client secret is sent only to the token api; the client keeps the token in memory and requests a new one when it expires.

# Issue sync token

**Method**: POST

**Path**: /api/v1/sync/auth/token

**Service**: pos-sync-service

request headers:

| key              | value              | required | description                                           |
| ---------------- | ------------------ | -------- | ----------------------------------------------------- |
| Content-Type     | `application/json` | true     |                                                       |
| x-partner-id     | string             | true     | merchant `partner_id`                                 |
| x-client-id      | string             | true     | merchant credential `client_id`                       |
| x-client-secret  | string             | true     | merchant credential `client_secret` (plain)           |
| x-correlation-id | string             | false    | correlation id for log, generate uuid if not provided |

request body:

| key | type   | required | description                                  |
| --- | ------ | -------- | -------------------------------------------- |
| tid | string | true     | terminal `tid` of the pos client, min length 1 |

example request body:

```json
{
  "tid": "0001000101"
}
```

response headers: `Cache-Control: no-store`

response body:

| key          | type   | description                               |
| ------------ | ------ | ----------------------------------------- |
| access_token | string | JWT (HS256), send as `Authorization: Bearer <access_token>` |
| token_type   | string | `Bearer`                                  |
| expires_in   | number | seconds until the token expires (`3600`)  |

example response body:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

error response:

| http status | body                                                                                                          | description                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 400         | `{ "message": "Validation failed", "errors": [{ "path": [], "message": "string" }], "request_id": "string" }` | request headers or body is invalid                                |
| 401         | `{ "message": "Invalid credential", "request_id": "string" }`                                                 | partner id / client id / client secret is wrong                   |
| 404         | `{ "message": "Terminal not found", "request_id": "string" }`                                                 | terminal not found, not mapped to a store, or not of the merchant |
| 500         | `{ "message": "Internal server error", "request_id": "string" }`                                              | unexpected error                                                  |

Logic:

- DTO Request
- Validate request headers with zod schema
  - x-partner-id, x-client-id, x-client-secret
    - type: string
    - min: 1
    - required: true
- Validate request body with zod schema
  - tid
    - type: string
    - min: 1
    - required: true
  - If validation fails, response http status 400 `Validation failed`
- Authenticate credential
  - find `merchant_credential` by `client_id` = `x-client-id` AND `provider` = `POS_CASHIER`
    - inner join `merchant` on `merchant_credential.merchant_id` = `merchant.id`
  - hash `x-client-secret` with SHA-256 (hex) and compare with `merchant_credential.client_secret` using constant time compare (`crypto.timingSafeEqual`)
  - check `merchant.partner_id` = `x-partner-id`
  - if credential not found, secret not match or partner id not match, response http status 401 `Invalid credential` (same message for every case, do not tell which one is wrong)
- Find terminal and store
  - find `terminal` by `tid`
    - inner join `map_store_terminal` on `terminal.id` = `map_store_terminal.terminal_id`
    - inner join `store` on `map_store_terminal.store_id` = `store.id`
  - check `store.merchant_id` = `merchant.id`
  - if terminal not found, not mapped to a store, or store is not of the merchant, response http status 404 `Terminal not found`
- Sign access token (JWT)
  - algorithm `HS256`, secret env `SYNC_JWT_SECRET` (different from portal-service `JWT_SECRET`)
  - `iss` = `pos-sync-service`, `aud` = `pos-cashier`, `jti` = uuid, `exp` = now + 3600 seconds
  - `sub` = terminal `tid`, `mid` = merchant `partner_id`, `sid` = store `sid` (only public ids, the client can read the token)
- DTO Response
- response http status 200 with `access_token`, `token_type` and `expires_in`, header `Cache-Control: no-store`

# Sync token middleware

runs before every sync api except the token api (`SyncTokenMiddleware`).

request headers (every sync api):

| key           | value                   | required | description                   |
| ------------- | ----------------------- | -------- | ----------------------------- |
| Authorization | `Bearer <access_token>` | true     | token from the token api      |

error response:

| http status | body                                                                         | description                                                                         |
| ----------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 401         | `{ "message": "Invalid token", "request_id": "string" }`                     | no token, wrong signature / issuer / audience / algorithm or invalid claims         |
| 401         | `{ "message": "Token expired", "request_id": "string" }`                     | token expired, the client requests a new token and retries                          |
| 403         | `{ "message": "Request does not match the token", "request_id": "string" }` | merchant / store / terminal in the body is not the one of the token                 |

Logic:

- read `Authorization` header, must start with `Bearer `, if not, response http status 401 `Invalid token`
- verify the JWT with `SYNC_JWT_SECRET`, algorithms `[HS256]` only, `iss` = `pos-sync-service`, `aud` = `pos-cashier`
  - if expired, response http status 401 `Token expired`
  - if any other error or claims `sub` / `mid` / `sid` missing, response http status 401 `Invalid token`
- set `req.syncAuth` = `{ partnerId: mid, sid, tid: sub }` for the api
- Check scope of the body (in each api, after validating the body)
  - every merchant `partner_id` in the body (`mid`, `merchant_id`) must be `req.syncAuth.partnerId`
  - every store `sid` in the body (`sid`, `store_id`) must be `req.syncAuth.sid`
  - every terminal `tid` in the body (`terminal_id`, when not null) must be `req.syncAuth.tid`
  - if not, response http status 403 `Request does not match the token` and nothing is synced

# Security notes

- do not write `x-client-secret`, `authorization` and `access_token` into any log (`SENSITIVE_KEYS` in `LoggerMiddleware`)
- the client must call the service over HTTPS only
- the token is stateless: after [rotate merchant credential](../../portal/flow/merchant/post-merchant-credential-rotate.md) the old secret cannot get a new token immediately, but tokens already issued still work until they expire (max 1 hour)
- changing `SYNC_JWT_SECRET` invalidates every issued token
