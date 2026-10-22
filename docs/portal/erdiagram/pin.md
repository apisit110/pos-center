```mermaid
erDiagram
  pin {
    int id PK "AUTO INCREMENT"
    varchar uuid UK "NOT NULL"
    int app_id "NOT NULL"
    varchar username "INDEX" "NOT NULL"
    varchar pin_hash "NOT NULL"
    int pin_failed_attempts
    datetime pin_locked_until
    datetime created_at "NOT NULL"
    datetime updated_at "NOT NULL"
  }
```

## Relationships

`pin` ไม่มี foreign key ไปยังตารางอื่น (standalone) — เชื่อมกับพนักงานเชิง logic ผ่าน `username` (เทียบกับ `center_staff.username`) โดย `app_id` ระบุแอปที่ใช้ PIN นี้

# Data Dictionary

## table: pin

ข้อมูล PIN ของผู้ใช้งานแต่ละแอปพลิเคชัน

| Field Name          | Data Type | Length | Key | Nullable | Description                                   |
| ------------------- | --------- | ------ | --- | -------- | --------------------------------------------- |
| id                  | int       | -      | PK  | No       | รหัสอ้างอิงภายใน (auto increment)             |
| uuid                | varchar   | 100    | UK  | No       | รหัสอ้างอิงสากลของ PIN                        |
| app_id              | int       | -      |     | No       | รหัสแอปพลิเคชันที่ใช้ PIN นี้                 |
| username            | varchar   | 100    | IDX | No       | ชื่อผู้ใช้เจ้าของ PIN                         |
| pin_hash            | varchar   | 255    |     | No       | PIN ที่เข้ารหัสแบบ hash (ห้ามเก็บ PIN จริง)   |
| pin_failed_attempts | int       | -      |     | Yes      | จำนวนครั้งที่กรอก PIN ผิดติดต่อกัน            |
| pin_locked_until    | datetime  | -      |     | Yes      | เวลาที่ PIN ถูกล็อกถึง (null = ไม่ถูกล็อก)    |
| created_at          | datetime  | -      |     | No       | วันที่สร้าง                                   |
| updated_at          | datetime  | -      |     | No       | วันที่แก้ไขล่าสุด                             |
