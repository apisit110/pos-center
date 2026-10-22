# ER-Diagram

## merchant & cashier
```mermaid
erDiagram
  merchant {
    int id PK "auto increment" "NOT NULL"
    varchar uid UK "NOT NULL"
    varchar partner_id UK "NOT NULL"
    varchar name_en "NOT NULL"
    varchar name_th "NOT NULL"
    datetime created_at "NOT NULL"
    datetime updated_at "NOT NULL"
  }

  merchant_profile {
    int id PK "auto increment" "NOT NULL"
    int merchant_id FK "NOT NULL"
    varchar mid UK
    datetime created_at
    datetime updated_at
  }

  merchant_credential {
    int id PK "auto increment" "NOT NULL"
    int merchant_id FK "NOT NULL"
    enum provider "POS_CASHIER"
    varchar client_id
    varchar client_secret
    datetime created_at
    datetime updated_at
  }

  store {
    int id PK "auto increment" "NOT NULL"
    int merchant_id FK
    varchar uid UK
    varchar sid UK
    varchar name_en
    varchar name_th
    datetime created_at
    datetime updated_at
  }

  address {
    int id PK "auto increment" "NOT NULL"
    int province_id FK
    int district_id FK
    int sub_district_id FK
    int postcode FK
    varchar address_1
    decimal latitude
    decimal longitude
    datetime created_at
    datetime updated_at
  }

  map_store_address {
    int store_id PK "NOT NULL"
    int address_id PK "NOT NULL"
    enum type "REGISTERED, CONTRACT"
    datetime created_at
    datetime updated_at
  }

  terminal {
    int id PK "auto increment" "NOT NULL"
    varchar uid UK
    varchar tid UK
    varchar name_en
    varchar name_th
    datetime created_at
    datetime updated_at
  }

  map_store_terminal {
    int store_id PK "NOT NULL"
    int terminal_id PK "NOT NULL"
    datetime created_at
    datetime updated_at
  }

  product {
    int id PK "auto increment" "NOT NULL"
    int merchant_id FK
    int brand_id FK
    varchar uid UK
    varchar name_en
    varchar name_th
    varchar sku
    varchar barcode
    decimal base_price "10,4"
    varchar image_url
    varchar unit_name
    datetime created_at
    datetime updated_at
  }

  brand {
    int id PK "auto increment" "NOT NULL"
    varchar uid UK
    varchar name_en
    varchar name_th
    datetime created_at
    datetime updated_at
  }

  map_store_product {
    int store_id PK "NOT NULL"
    int product_id PK "NOT NULL"
    int stock
    decimal price "10,4"
    int sync_version "DEFAULT 0"
    datetime created_at
    datetime updated_at
  }

  order {
    int id PK "auto increment" "NOT NULL"
    int merchant_id FK
    int store_id FK
    int terminal_id FK
    int cashier_staff_id FK
    int member_id FK
    varchar order_id UK
    decimal total_amount "10,4"
    varchar status "PENDING, PAID, VOID, REFUNDED"
    boolean is_synced
    datetime created_at
    datetime updated_at
  }

  order_items {
    int id PK "auto increment" "NOT NULL"
    int order_id FK
    int product_id FK
    decimal price "10,4"
    int quantity
    datetime created_at
    datetime updated_at
  }

  order_sync_logs {
    int id PK "auto increment" "NOT NULL"
    int store_id FK
    varchar pos_temp_id "index"
    varchar global_order_id "index"
    datetime synced_at
  }
```

## Master Data Province & District & Sub District

```mermaid
erDiagram
  provinces {
    int id PK "auto increment" "NOT NULL"
    varchar code UK
    varchar name_en
    varchar name_th
    datetime created_at
    datetime updated_at
    
  }
  districts {
    int id PK "auto increment" "NOT NULL"
    int province_id FK
    varchar code UK
    varchar name_en
    varchar name_th
    datetime created_at
    datetime updated_at
  }
  sub_districts {
    int id PK "auto increment" "NOT NULL"
    int district_id FK
    varchar code UK
    varchar name_en
    varchar name_th
    varchar latitude
    varchar longitude
    datetime created_at
    datetime updated_at
  }
  postal_code {
    int id PK "auto increment" "NOT NULL"
    int sub_district_id FK
    varchar code UK
  }
```

## Cashier

```mermaid
erDiagram
  cashier_staff {
    int id PK "auto increment" "NOT NULL"
    varchar uid UK
    varchar username "index"
    varchar full_name
    enum status "PENDING, ACTIVE, SUSPENDED, INACTIVE"
    enum sync_status "PENDING, SYNCED, ERROR"
    varchar sync_id
    datetime created_at
    datetime updated_at
  }

  cashier_role {
    int id PK "auto increment" "NOT NULL"
    varchar name
    datetime created_at
    datetime updated_at
  }

  cashier_staff_role {
    int staff_id PK
    int role_id PK
    datetime created_at
    datetime updated_at
  }

  cashier_permission {
    int id PK "auto increment"
    string name
    datetime created_at
    datetime updated_at
  }

  cashier_role_permissions {
    int id PK "auto increment" "NOT NULL"
    int role_id FK
    varchar permission_key
    boolean is_granted
  }
```

# Data Dictionary

## table: merchant

| Field Name | Data Type | Length | Key | Nullable | Description |
| ---------- | --------- | ------ | --- | -------- | ----------- |
| id         | int       | -      | PK  |          |             |
| uid        | varchar   | 100    | UK  |          |             |
| partner_id | varchar   | 20     | UK  |          |             |
| name       | varchar   | 255    |     |          |             |
| created_at | datetime  | -      |     |          |             |
| updated_at | datetime  | -      |     |          |             |
