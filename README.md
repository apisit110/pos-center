the system have many merchant
one merchant have own product
one merchant have many store
one merchant have many staff
one store have many product

table

- products
  - id
  - merchant_id
  - name
  - sku
  - barcode
  - base_price
  - image_url
  - brand

- stores
  - id
  - merchant_id
  - name
  - address
  - latitude
  - longitude

- store_products
  - id
  - store_id
  - product_id
  - stock
  - price
  - unit

create
[ ] create model
[ ] migration file
[ ] create seed
[ ] sync product

Migration

- สร้างไฟล์ schema.ts
- รัน `npx drizzle-kit generate` จะได้ไฟล์ sql ใน folder ./drizzle/
- รัน npx drizzle-kit migrate

Edit Down

- ลบไฟล์ Migration: ใช้คำสั่ง npx drizzle-kit drop คำสั่งนี้จะลบไฟล์ SQL ล่าสุดออกจากโฟลเดอร์ drizzle/ (และลบประวัติในตาราง \_\_drizzle_migrations ในเครื่องเราให้ด้วย)
- แก้ไข Schema: กลับไปแก้ไฟล์ schema.ts ให้ถูกต้องตามที่ต้องการ
- Generate ใหม่: รัน `npx drizzle-kit generate` อีกครั้งเพื่อให้ได้ไฟล์ SQL ที่ถูกต้อง
- Migrate: รัน `npx drizzle-kit migrate` เพื่อนำโครงสร้างใหม่ลง Database

---

เมื่อคุณตัดสินใจใช้แนวทาง **Forward-only migrations** (ซึ่งเป็นวิธีมาตรฐานของ Drizzle และเครื่องมือสมัยใหม่อย่าง Prisma หรือแนวทาง DevOps ทั่วไป) วิธีการแก้ไขเมื่อเกิดข้อผิดพลาดจะแบ่งออกเป็น 2 สถานการณ์หลักครับ:

---

## 1. กรณีเกิดข้อผิดพลาดในเครื่อง Dev (ยังไม่เอาขึ้น Production)

ถ้าคุณเพิ่งรัน `generate` แล้วพบว่า SQL ที่ได้มันผิด หรือเปลี่ยนใจไม่อยากเปลี่ยน Schema แล้ว ให้ทำดังนี้:

1.  **ลบไฟล์ Migration:** ใช้คำสั่ง `npx drizzle-kit drop` คำสั่งนี้จะลบไฟล์ SQL ล่าสุดออกจากโฟลเดอร์ `drizzle/` (และลบประวัติในตาราง `__drizzle_migrations` ในเครื่องเราให้ด้วย)
2.  **แก้ไข Schema:** กลับไปแก้ไฟล์ `schema.ts` ให้ถูกต้องตามที่ต้องการ
3.  **Generate ใหม่:** รัน `npx drizzle-kit generate` อีกครั้งเพื่อให้ได้ไฟล์ SQL ที่ถูกต้อง
4.  **Migrate:** รัน `npx drizzle-kit migrate` เพื่อนำโครงสร้างใหม่ลง Database

---

## 2. กรณีเกิดข้อผิดพลาดบน Production (ข้อมูลถูกเปลี่ยนไปแล้ว)

นี่คือจุดที่คนมักกังวลที่สุด ในโลกของ Forward-only เราจะไม่กด "Undo" แต่เราจะ **"สร้าง Migration ใหม่เพื่อแก้ตัวเก่า"** ครับ

### ขั้นตอนการทำ "Fix Forward":

1.  **แก้ไข Code ให้กลับไปเป็นแบบเดิม:** แก้ `schema.ts` ให้กลับไปสู่สถานะที่ถูกต้อง (เช่น ถ้าเผลอเพิ่ม Column ผิด ก็ให้ลบ Column นั้นออกจาก Code)
2.  **Generate Migration ใหม่:**
    ```bash
    npx drizzle-kit generate
    ```
    Drizzle จะตรวจพบว่า Schema ใน Code (ที่เอาออกแล้ว) ไม่ตรงกับไฟล์ Migration ล่าสุด มันจะสร้างไฟล์ SQL ใหม่ (เช่น `0002_fix_previous_error.sql`) ซึ่งภายในจะมีคำสั่ง `ALTER TABLE ... DROP COLUMN ...` เพื่อย้อนสถานะ DB กลับไป
3.  **Deploy ตามปกติ:** รัน `npx drizzle-kit migrate` บน Production
    - **ข้อดี:** ประวัติการ Migration จะเรียงต่อกันเป็นเส้นตรง (0001 -> 0002) ไม่มีการย้อนกลับไปมาให้ Database งง
    - **ความปลอดภัย:** ตรวจสอบได้ว่าใครทำอะไร และแก้อะไรใน Git History

---

## 3. กรณีเลวร้ายที่สุด: ข้อมูลสูญหาย (Data Loss)

หาก Migration ที่ผิดพลาดนั้นสั่ง `DROP TABLE` หรือ `DROP COLUMN` ที่มีข้อมูลสำคัญอยู่บน Production ไปแล้ว:

- **Forward-only migration ช่วยกู้ข้อมูลไม่ได้:** ต่อให้คุณสั่ง `CREATE TABLE` กลับมา ตารางนั้นก็จะว่างเปล่า
- **ทางแก้เดียว:** คุณต้อง **Restore Database จาก Backup** ล่าสุดก่อนที่จะรัน Migration นั้นครับ

> **💡 คำแนะนำระดับมืออาชีพ:**
> ก่อนจะรัน `migrate` บน Production เสมอ:
>
> 1.  ตรวจสอบไฟล์ `.sql` ที่ Drizzle สร้างให้อย่างละเอียด (อย่ารันโดยไม่ดู)
> 2.  ทำ Database Snapshot หรือ Backup ไว้ก่อนเสมอ

---

## 📋 สรุปการ Rollback ของ Drizzle

| สถานะ                      | วิธีการ (Action)                                                                     |
| :------------------------- | :----------------------------------------------------------------------------------- |
| **Local / Dev**            | ใช้ `npx drizzle-kit drop` -> แก้ Schema -> Generate ใหม่                            |
| **Production**             | แก้ Schema ใน Code ให้กลับเป็นแบบที่ถูก -> Generate ไฟล์แก้ -> Migrate ต่อไปข้างหน้า |
| **โครงสร้างพัง/ข้อมูลหาย** | Restore จาก Backup (เป็นวิธีที่ปลอดภัยที่สุดสำหรับทุก ORM)                           |

การทำแบบนี้อาจจะดูขัดใจในช่วงแรกที่มาจาก Sequelize แต่ในระยะยาวมันจะช่วยให้การทำ **CI/CD** เสถียรมาก เพราะไม่มีการรันคำสั่งย้อนกลับที่อาจจะพังกลางคันครับ

คุณพอจะเห็นภาพไหมครับว่าการ "เดินหน้าเพื่อแก้ไข" (Fix-forward) มันปลอดภัยกว่าการกด Undo ในระบบอัตโนมัติอย่างไร?

---

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
pnpm --filter @lightning/database db:generate
pnpm --filter @lightning/database db:migrate

<!-- pnpm --filter @lightning/database db:seed -->
