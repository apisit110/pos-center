-- Create the user
CREATE USER lightning WITH PASSWORD 'lightning';

-- Give the user permission to create databases
ALTER USER lightning CREATEDB;

-- Create the database (if you haven't yet)
CREATE DATABASE lightning_pos;

-- Grant all permissions on the database to the new user
GRANT ALL PRIVILEGES ON DATABASE lightning_pos TO lightning;

-- Exit
\q

---

drop db ใน pgadmin4
create db lightning_pos ใน pgadmin4
rm -rf packages/database/drizzle
pnpm --filter @pos-center/database db:generate
pnpm --filter @pos-center/database db:migrate
pnpm --filter @pos-center/database db:seed
pnpm run dev

---

center
admin
123456

cashier
00010001
123456

MERCHANT_ID=0001
STORE_ID=00010001
TERMINAL_ID=0001000101

---

# กรณี mode = offline

## Cashier

อยากให้สร้าง user 2 คนสำหรับ manager และ cashier

Config

| xxx           | xxxx                                 |
| ------------- | ------------------------------------ |
| merchant      | 0001                                 |
| store         | 00010001                             |
| terminal      | 0001000101                           |
| staff         |                                      |
| staff.manager | username: 00010001, password: 123456 |
| staff.cashier | username: 00010002, password: 123456 |

Migrate & Seed

| xxx     | xxxx            |
| ------- | --------------- |
| manager | ไปสร้าง product |
| cashier | เริ่มขาย        |

# กรณี mode = online

## Center

- สร้าง merchant
- สร้าง store
- สร้าง terminal
- สร้าง staff ของระบบ cashier
- [optional] - สร้าง product เข้า store และ กำหนดราคาใน xlsx
- สร้าง credential (provider `POS_CASHIER`) ในหน้า merchant detail, `client_secret` แสดงครั้งเดียว
- ส่ง config ให้ cashier (ดูได้ในหน้า merchant detail)
  - partner_id
  - client_id
  - client_secret
  - tid (ไม่ต้องส่ง sid, ระบบหาจาก tid)


## Cashier

- config ให้ใช้ online mode
- เข้าเว็บจะแสดงให้กรอก terminal id ตอนกรอก terminal id จะ sync ข้อมูล
  - merchant
  - store
  - staff
  - sync product


> เปลี่ยน mid เป็น partner id
> เพราะ 1 ร้านมีได้หลาน mid

---

```bash
docker compose -f ./docker-compose-dev.yml up
```
