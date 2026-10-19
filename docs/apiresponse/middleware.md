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

# InternalServiceError

except @docs/apiresponse/InternalServiceError.ts

response to client with status code 500

# else

response to client with status code 500

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
