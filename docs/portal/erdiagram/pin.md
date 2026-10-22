```mermaid
erDiagram
  center_pin {
    int id PK "auto increment"
    varchar uuid UK
    int app_id
    varchar username "index"
    varchar pin_hash
    int pin_failed_attempts
    datetime pin_locked_until
    datetime created_at
    datetime updated_at
  }
```
