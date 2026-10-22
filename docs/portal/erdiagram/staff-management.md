```mermaid
erDiagram
  center_staff ||--o{ center_staff_role : "has"
  center_role ||--o{ center_staff_role : "assigned to"
  center_role ||--o{ center_role_permission : "grants"
  center_permission ||--o{ center_role_permission : "granted to"

  center_staff {
    int id PK "AUTO INCREMENT" "NOT NULL"
    varchar uid UK "NOT NULL"
    varchar username "INDEX" "NOT NULL"
    varchar full_name
    varchar status "PENDING, ACTIVE, SUSPENDED, INACTIVE" "NOT NULL"
    datetime created_at "NOT NULL"
    datetime updated_at "NOT NULL"
  }

  center_role {
    int id PK "AUTO INCREMENT" "NOT NULL"
    varchar name "NOT NULL"
    datetime created_at "NOT NULL"
    datetime updated_at "NOT NULL"
  }

  center_staff_role {
    int staff_id PK, FK "NOT NULL"
    int role_id PK, FK "NOT NULL"
    datetime created_at "NOT NULL"
    datetime updated_at "NOT NULL"
  }

  center_permission {
    int id PK "AUTO INCREMENT" "NOT NULL"
    varchar name "NOT NULL"
    datetime created_at "NOT NULL"
    datetime updated_at "NOT NULL"
  }

  center_role_permission {
    int role_id PK, FK "NOT NULL"
    int permission_id PK, FK "NOT NULL"
    datetime created_at "NOT NULL"
    datetime updated_at "NOT NULL"
  }
```

## Relationships

| Parent Table      | Child Table            | Cardinality | FK (Child)    | Description                                      |
| ----------------- | ---------------------- | ----------- | ------------- | ------------------------------------------------ |
| center_staff      | center_staff_role      | 1 : 0..N    | staff_id      | พนักงาน 1 คนมีได้ 0 หรือหลาย role                |
| center_role       | center_staff_role      | 1 : 0..N    | role_id       | role 1 ตัวถูกกำหนดให้พนักงานได้หลายคน             |
| center_role       | center_role_permission | 1 : 0..N    | role_id       | role 1 ตัวมีได้หลายสิทธิ์                        |
| center_permission | center_role_permission | 1 : 0..N    | permission_id | สิทธิ์ 1 รายการถูกกำหนดให้หลาย role ได้          |

`center_staff` ↔ `center_role` และ `center_role` ↔ `center_permission` เป็น many-to-many ผ่านตารางเชื่อม `center_staff_role` และ `center_role_permission`

# Data Dictionary

## table: center_staff

ข้อมูลพนักงานของระบบศูนย์

| Field Name | Data Type | Length | Key | Nullable | Description                                          |
| ---------- | --------- | ------ | --- | -------- | ---------------------------------------------------- |
| id         | int       | -      | PK  | No       | รหัสอ้างอิงภายใน (auto increment)                    |
| uid        | varchar   | 100    | UK  | No       | รหัสอ้างอิงสากลของพนักงาน                            |
| username   | varchar   | 100    | IDX | No       | ชื่อผู้ใช้                                           |
| full_name  | varchar   | 255    |     | Yes      | ชื่อ-นามสกุล                                         |
| status     | varchar   | 20     |     | No       | สถานะ: `PENDING`, `ACTIVE`, `SUSPENDED`, `INACTIVE` |
| created_at | datetime  | -      |     | No       | วันที่สร้าง                                          |
| updated_at | datetime  | -      |     | No       | วันที่แก้ไขล่าสุด                                    |

## table: center_role

ข้อมูล role ของพนักงาน

| Field Name | Data Type | Length | Key | Nullable | Description                       |
| ---------- | --------- | ------ | --- | -------- | --------------------------------- |
| id         | int       | -      | PK  | No       | รหัสอ้างอิงภายใน (auto increment) |
| name       | varchar   | 100    |     | No       | ชื่อ role                         |
| created_at | datetime  | -      |     | No       | วันที่สร้าง                       |
| updated_at | datetime  | -      |     | No       | วันที่แก้ไขล่าสุด                 |

## table: center_staff_role

ตารางเชื่อมระหว่างพนักงานกับ role

| Field Name | Data Type | Length | Key | Nullable | Description             |
| ---------- | --------- | ------ | --- | -------- | ----------------------- |
| staff_id   | int       | -      | PK, FK | No    | อ้างอิง center_staff.id |
| role_id    | int       | -      | PK, FK | No    | อ้างอิง center_role.id  |
| created_at | datetime  | -      |     | No       | วันที่สร้าง             |
| updated_at | datetime  | -      |     | No       | วันที่แก้ไขล่าสุด       |

## table: center_permission

รายการสิทธิ์ทั้งหมดในระบบ

| Field Name | Data Type | Length | Key | Nullable | Description                       |
| ---------- | --------- | ------ | --- | -------- | --------------------------------- |
| id         | int       | -      | PK  | No       | รหัสอ้างอิงภายใน (auto increment) |
| name       | varchar   | 100    |     | No       | ชื่อสิทธิ์ (permission key)       |
| created_at | datetime  | -      |     | No       | วันที่สร้าง                       |
| updated_at | datetime  | -      |     | No       | วันที่แก้ไขล่าสุด                 |

## table: center_role_permission

สิทธิ์ที่ถูกกำหนดให้แต่ละ role

| Field Name    | Data Type | Length | Key | Nullable | Description                 |
| ------------- | --------- | ------ | --- | -------- | --------------------------- |
| role_id       | int       | -      | PK, FK | No    | อ้างอิง center_role.id       |
| permission_id | int       | -      | PK, FK | No    | อ้างอิง center_permission.id |
| created_at    | datetime  | -      |     | No       | วันที่สร้าง                 |
| updated_at    | datetime  | -      |     | No       | วันที่แก้ไขล่าสุด           |
