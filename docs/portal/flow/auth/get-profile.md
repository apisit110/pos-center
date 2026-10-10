this api use for get profile using jwt token

Method: GET
Path: /api/v1/auth/me

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
  "user": {
    "uid": "string",
    "name": "string",
    "merchant_id": "string"
  }
}
```

Logic:

- Verify access token
- Check access token expire
- Validate Permission
- Validate Payload
- Check Profile by uid
- Find staff detail by uid in access token
- DTO Response
- response staff detail follow these uid, name, merchant_id
