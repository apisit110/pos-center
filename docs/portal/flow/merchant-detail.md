# Merchant Detail Flow (ของจริงในโค้ดปัจจุบัน)

```mermaid
sequenceDiagram
    actor User
    participant FrontEnd as FrontEnd (MerchantDetailPage)
    participant Backend as Backend (Merchant/Store Controller)
    participant Database

    User->>FrontEnd: เข้าหน้า /merchants/:uid
    FrontEnd->>Backend: GET /merchants/:uid (cookie: token)
    FrontEnd->>Backend: GET /stores?merchantId=:uid (cookie: token)
    FrontEnd->>Backend: GET /merchants/:uid/staff (cookie: token)
    Note over FrontEnd,Backend: ยิง 3 request พร้อมกันด้วย Promise.all

    par สำหรับแต่ละ request
        Backend->>Backend: authMiddleware: jwt.verify(cookie "token", JWT_SECRET)
        alt ไม่มี/หมดอายุ/ผิด token
            Backend-->>FrontEnd: 401 { message: "Unauthorized" }
        else verify ผ่าน (ไม่เช็ค role/ownership ของ merchant นี้เลย)
            alt GET /merchants/:uid
                Backend->>Database: SELECT * FROM merchants WHERE uid = :uid LIMIT 1
                Database-->>Backend: merchant หรือ null
                alt ไม่พบ merchant
                    Backend-->>FrontEnd: 404 { message: "Merchant not found" }
                else พบ
                    Backend-->>FrontEnd: 200 { uid, mid, name }
                end
            else GET /stores?merchantId=:uid
                Backend->>Database: SELECT stores JOIN merchants WHERE merchants.uid = :uid (ไม่มี LIMIT/pagination)
                Database-->>Backend: stores ทั้งหมดของ merchant นี้
                Backend-->>FrontEnd: 200 [ { uid, sid, name, address, ... } ]
            else GET /merchants/:uid/staff
                Backend->>Database: หา merchant.id จาก uid, แล้ว SELECT staff LEFT JOIN staff_role/role WHERE staff.merchant_id = merchant.id
                Database-->>Backend: staff ทั้งหมดของ merchant นี้ (role จาก join, default 'cashier' ถ้าไม่มี role)
                Backend-->>FrontEnd: 200 [ { uid, name, role, username, status } ]
            end
        end
    end

    FrontEnd->>FrontEnd: setMerchant / setStores / setStaff จากผลทั้ง 3 request
    alt merchant เป็น null (404 หรือ error)
        FrontEnd->>User: แสดง "Merchant not found"
    else
        FrontEnd->>User: render Merchant Info + ตาราง Related Stores + ตาราง Staff
    end
```

## สิ่งที่ต่างจาก "มาตรฐานที่ควรมี"

โค้ดปัจจุบัน (`MerchantController.getById/getStaff`, `StoreController.getAll`, `apps/portal/src/app/(authenticated)/merchants/[id]/page.tsx`) มีพฤติกรรมดังนี้:

| ประเด็น | ที่เป็นอยู่จริง | มาตรฐานที่ควรมี | เหตุผล |
|---|---|---|---|
| Authorization (RBAC/ownership) | authMiddleware เช็คแค่ token valid ไม่เช็คว่า staff ที่ login มีสิทธิ์ดู merchant นี้หรือไม่ (ใส่ uid merchant อะไรก็ query ได้ถ้า login อยู่) | ควรเช็คว่า role เป็น super admin หรือ merchant นี้เป็นของ staff ที่ login อยู่ ก่อน query | ป้องกัน IDOR: staff ของ merchant A ดูข้อมูล merchant B ได้โดยแค่เปลี่ยน uid ใน URL |
| Consistency ของ error | `/merchants/:uid` และ `/merchants/:uid/staff` ใช้ uid เดียวกัน แต่ `/stores?merchantId=` ถ้า merchant ไม่พบจะได้ array ว่าง ไม่ใช่ 404 | ควรตอบ error/สถานะให้สอดคล้องกันเมื่อ merchant ไม่มีอยู่จริง | ฝั่ง client ต้องเดาเองว่า merchant ไม่มีจริงหรือแค่ไม่มี store/staff |
| Fan-out request | หน้า detail ยิง 3 request แยกกัน (merchant, stores, staff) ไม่มี endpoint รวม | อาจพิจารณาทำ `/merchants/:uid/summary` รวมข้อมูลในครั้งเดียวถ้าต้องการลด round-trip | ลดจำนวน request และปัญหา partial failure (เช่น merchant call fail แต่ stores/staff request ผ่าน) |
| Pagination | รายการ stores/staff ของ merchant ไม่มี limit เลย ดึงมาทั้งหมด | ควรมี limit/pagination ถ้าจำนวน store/staff ต่อ merchant อาจเยอะ | ป้องกัน response ใหญ่เกินไปเมื่อ merchant มี store/staff จำนวนมาก |
| Audit log | ไม่มีการบันทึกว่าใครเปิดดู merchant ไหนบ้าง | ควร log การเข้าถึงข้อมูล merchant รายตัว | ใช้ตรวจสอบย้อนหลังกรณีข้อมูลรั่ว |
