# Language

error `res_desc` is a string in the language of the request: read request header `Accept-Language`, use `th` if it starts with `th`, otherwise `en` (default `en`). the error classes keep `resDesc` as `{ en, th }`, the error middleware picks one. success `res_desc` is always empty string.

error response body:

```json
{
  "res_code": "4000",
  "res_desc": "Invalid request",
  "details": "string",
  "additional": "string",
  "request_id": "string"
}
```

# ValidationError

response to client with status code 400

every zod validation failure (path, query, body) must be converted to [ValidationError.ErrInvalidRequest](ValidationError.ts) (`res_code` `4000`), not the raw zod error

# ServiceError

except @docs/apiresponse/ServiceError.ts

response to client with status code from `kind` of the error ([ErrorKind](ErrorKind.ts))

| kind | status code |
| ---- | ----------- |
| BAD_REQUEST | 400 |
| FORBIDDEN | 403 |
| NOT_FOUND | 404 |
| PAYLOAD_TOO_LARGE | 413 |
| TOO_MANY_REQUESTS | 429 |

| error | res_code | when |
| ----- | -------- | ---- |
| [ServiceError.ErrPayloadTooLarge](ServiceError.ts) | `4130` | request body larger than 10 MB |
| [ServiceError.ErrTooManyRequests](ServiceError.ts) | `4290` | login rate limit: more than 20 requests per 15 minutes (per client) on `POST /api/v1/auth/login` |

both use the standard error body (`res_code`, `res_desc`, `request_id`), `res_desc` follows `Accept-Language`

# InternalServiceError

except @docs/apiresponse/InternalServiceError.ts

response to client with status code 500

# else

any other unexpected error: log the error, then respond with status code 500 and [InternalServiceError.ErrInternalServerError](InternalServerError.ts) (`res_code` `5000`), same body as above. never expose the error message or stack to the client

# Ok

every success response uses [Ok](Ok.ts), response to client with status code `httpStatus` (200 for get, 201 for create)

external body is `snake_case` (follow code style in specification)

| key      | type   | description                                                  |
| -------- | ------ | ------------------------------------------------------------ |
| res_code | string | always `0000` for success                                    |
| res_desc | string | always empty string for success                              |
| data     | any    | response data of each api (object, array, or omitted if none) |

```json
{
  "res_code": "0000",
  "res_desc": "",
  "data": {}
}
```

each api doc describes only the value of `data`
