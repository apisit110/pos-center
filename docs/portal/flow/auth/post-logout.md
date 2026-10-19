this api use for logout with access token in header

Method: POST
Path: /api/v1/auth/logout

example request headers:

```json
Authorization: Bearer <token>
```

example request body:

```json
```

example response body:

```json
{
  "res_code": "0000",
  "res_desc": ""
}
```

Logic:

- clear cookie
- DTO Response
- wrap the response with [Ok](../../../apiresponse/Ok.ts) (`res_code` `0000`), no `data`
