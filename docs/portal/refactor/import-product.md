# Import product (master_product_v2.xlsx)

## Goal

หน้า `/products/new` (โหมด Import) เปลี่ยนจากนำเข้าไฟล์ JSON เป็นไฟล์ Excel `master_product_v2.xlsx` ที่รวมข้อมูล product และ store_product ไว้ในไฟล์เดียว

- sheet `product` → สร้าง product ให้ merchant ที่เลือก
- sheet `store_product` (optional) → ถ้ามี จะ map ราคาและ stock เข้า `map_store_product` ของ store ที่เลือก
- sheet `brand` (optional) → ถ้ามี จะสร้าง/อัปเดต brand ก่อน แล้ว product อ้างถึง brand ด้วย `brand_uid`

ไฟล์ตั้งต้นอยู่ที่ `apps/portal/public/constants/` (ไฟล์ JSON เดิม `master_product_v1.json` / `master_store_product.json` ถูกลบแล้ว)

- `master_product_v2_prouct_with_store_product.xlsx` — sheet `product` + `store_product` + `brand`, 9,809 แถว (product / store_product), 41 brand
- `master_product_v3_no_store_product.xlsx` — sheet `product` + `brand`, 9,809 แถว, 41 brand
- `draft_product.json` — สินค้า 18 รายการที่ barcode ซ้ำ (10 รายการเป็น placeholder `XXXXXXXX`) ถูกถอดออกจากไฟล์ข้างบนเพื่อรอแก้ barcode

สินค้า 1 รายการที่ไม่มีชื่อ (`name_en` และ `name_th` ว่าง) ถูกลบออกจากทุกไฟล์ เพราะ API `POST /products/batch` ต้องมี `name` อย่างน้อย 1 ตัวอักษร

## File format

แถวแรกของแต่ละ sheet คือ header (ชื่อ column ตามตารางด้านล่าง), ข้อมูลเริ่มแถวที่ 2, ค่า `null` = cell ว่าง

### sheet1: `product`

| column            | type   | required | description                                                                 |
| ----------------- | ------ | -------- | --------------------------------------------------------------------------- |
| uid               | string | true     | product uid (คงค่าเดิมตามไฟล์, ใช้เป็น key ที่ `store_product.product_uid`) |
| image_url         | string | false    | JSON array ของ path รูป เช่น `["products/a-1.jpeg","products/a-2.jpeg"]`      |
| name_en           | string | false    | ชื่อภาษาอังกฤษ                                                              |
| name_th           | string | true*    | ชื่อภาษาไทย (*ถ้าไม่มี ใช้ `name_en`)                                        |
| brand_en          | string | false    | ชื่อ brand เดิม (อ้างอิงเท่านั้น ไม่ส่งเข้า API ใช้ `brand_uid` แทน)          |
| brand_th          | string | false    | ชื่อ brand เดิม (อ้างอิงเท่านั้น ไม่ส่งเข้า API ใช้ `brand_uid` แทน)          |
| company_name_en   | string | false    | ยังไม่ส่งเข้า API (API ยังไม่รองรับ)                                         |
| company_name_th   | string | false    | ยังไม่ส่งเข้า API (API ยังไม่รองรับ)                                         |
| base_price        | number | true     | min 0                                                                       |
| unit_name         | string | false    |                                                                             |
| barcode           | string | false    | เก็บเป็น text ห้ามให้ Excel แปลงเป็นตัวเลข                                   |
| qrcode            | string | false    | ยังไม่ส่งเข้า API (API ยังไม่รองรับ)                                         |
| brand_uid         | string | false    | อ้างถึง `brand.uid` ของ sheet `brand` (หรือ brand ที่มีอยู่แล้วใน DB)          |

### sheet2: `store_product` (optional)

| column      | type   | required | description                                                                                          |
| ----------- | ------ | -------- | ---------------------------------------------------------------------------------------------------- |
| product_uid | string | true     | อ้างถึง `product.uid`                                                                                 |
| stock       | number | true     | min 0                                                                                                |
| price       | number | true     | ราคาขายใน store, min 0                                                                               |
| price_tiers | string | false    | JSON array เช่น `[{"min_qty":1,"max_qty":1,"unit_price":13,"tier":1}]` เก็บในไฟล์เท่านั้น ยังไม่ส่งเข้า API |

### sheet3: `brand` (optional)

| column  | type   | required | description                                                                 |
| ------- | ------ | -------- | --------------------------------------------------------------------------- |
| uid     | string | true     | brand uid (UUID v5 จาก `name_th` ทำให้ทั้งสองไฟล์ได้ uid เดียวกัน)            |
| name_en | string | true*    | ชื่อภาษาอังกฤษ (*ถ้าไม่มี ใช้ `name_th`)                                      |
| name_th | string | true*    | ชื่อภาษาไทย (*ถ้าไม่มี ใช้ `name_en`)                                         |

brand สร้างจาก `brand_th` เดิมของ sheet `product` (ไฟล์เดิมไม่มี `brand_en`, ชื่ออังกฤษเพิ่มทีหลังและควรตรวจทาน), `ไวตามิลค์` / `ไวตามิ้ลค์` ถูกรวมเป็น brand เดียว

## Flow (หน้า `/products/new`, โหมด Import)

1. เลือก Merchant (required)
2. เลือกไฟล์: drag & drop / browse `.xlsx` หรือกด "Load Master Product List" (fetch `/constants/master_product_v2.xlsx`)
3. Parse ไฟล์ในเบราว์เซอร์ (`exceljs`, dynamic import) → แสดง Preview ตาราง product และจำนวน store product
4. ถ้าไฟล์มี sheet `store_product` → แสดง dropdown **Store** (กรองตาม merchant ที่เลือก, required) ทุกแถวจะถูก map เข้า store นี้
5. กด Import
   0. ถ้ามี sheet3: `POST /api/v1/brands/batch` ส่ง brand ทั้งหมด ([post-brands-batch](../flow/brand/post-brands-batch.md))
   1. `POST /api/v1/products/batch` ส่ง product จาก sheet1 ([post-products-batch](../flow/product/post-products-batch.md)), `uid` ใช้ค่าตามไฟล์
   2. ถ้ามี sheet2: `POST /api/v1/store-products/batch` ส่ง `{ store_uid, product_uid, stock, price }` ([post-store-products-batch](../flow/store-product/post-store-products-batch.md))
      - ส่งเฉพาะแถวที่ `product_uid` มีใน sheet1 (ข้ามขั้นนี้ถ้าขั้นที่ 1 สร้างได้ 0 รายการ)
      - product ที่ขั้นที่ 1 สร้างไม่ได้ จะถูก API รายงานในขั้นที่ 2 เป็น `product_uid "..." not found` / `forbidden` (ไม่ได้กรองฝั่ง portal เพราะ errors ของขั้นที่ 1 ระบุเป็นเลขแถว)
6. แสดงผลสรุป: created products, created/updated store products และรายการ errors

## Field mapping

product → `POST /products/batch`

| xlsx                      | request                                  |
| ------------------------- | ---------------------------------------- |
| uid                       | `uid`                                    |
| (merchant ที่เลือก)        | `merchant_uid`                           |
| name_en \|\| name_th      | `name_en`                                |
| name_th \|\| name_en      | `name_th`                                |
| barcode                   | `barcode`                                |
| base_price                | `base_price`                             |
| image_url (parse JSON)    | `image_url` (รูปแรก, ไม่ส่งถ้าว่าง)        |
| brand_uid                 | `brand_uid` (ไม่ส่งถ้าว่าง)               |
| unit_name                 | `unit_name`                              |

brand → `POST /brands/batch`

| xlsx    | request   |
| ------- | --------- |
| uid     | `uid`     |
| name_en | `name_en` |
| name_th | `name_th` |

store_product → `POST /store-products/batch`

| xlsx        | request                |
| ----------- | ---------------------- |
| (store ที่เลือก) | `store_uid`        |
| product_uid | `product_uid`          |
| stock       | `stock`                |
| price       | `price`                |
| price_tiers | ไม่ส่ง (API ยังไม่รองรับ) |

## Validation / edge cases

- ไม่มี sheet `product` หรือ header ไม่ครบ (`uid`, `base_price`) → แสดง error "Invalid master product file" และไม่เปลี่ยน state
- ไม่มี sheet `store_product` → import เฉพาะ product, ไม่แสดง dropdown Store
- แถวใน `store_product` ที่ `product_uid` ไม่อยู่ใน sheet `product` → ข้าม และใส่ใน errors
- มี sheet `store_product` แต่ยังไม่เลือก Store → ปุ่ม Import ถูก disable
- เปลี่ยน Merchant → โหลด Store ใหม่และ reset Store ที่เลือก
- product `uid` ที่เป็นของ merchant อื่นอยู่แล้ว → API รายงานเป็น error (`Forbidden: uid belongs to another merchant`) และแถว store_product ของ product นั้นถูกรายงาน `forbidden`
- Import ซ้ำ: product ถูก update ตาม `uid`, store_product ที่มีอยู่แล้วถูก update stock/price (นับใน `updated`)
- Chunk: ส่งครั้งละ 1000 แถว ถูกจัดการใน `ApiProductRepository` / `ApiStoreProductRepository` อยู่แล้ว

## Out of scope / future

- `price_tiers`, `company_name_*`, `qrcode`: อยู่ในไฟล์แต่ API ยังไม่รับ ต้องขยาย API + docs ก่อนจึงจะส่งได้
- ระบุ `store_uid` ต่อแถวในไฟล์ (ปัจจุบันเลือก store เดียวที่ UI)
