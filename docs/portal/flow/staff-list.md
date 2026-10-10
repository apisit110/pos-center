# Staff List Flow (ของจริงในโค้ดปัจจุบัน)

```mermaid
sequenceDiagram
    actor User
    participant FrontEnd as FrontEnd (StaffPage /staff)
    participant Backend as Backend (StaffController)
    participant Database

    User->>FrontEnd: เข้าหน้า /staff
    FrontEnd->>Backend: GET /staff?page=1&limit=10 (cookie: token, withCredentials)
    Backend->>Backend: authMiddleware: jwt.verify(cookie "token", JWT_SECRET)

    alt ไม่มี cookie token หรือ verify ไม่ผ่าน
        Backend-->>FrontEnd: 401 { message: "Unauthorized" }
    else verify ผ่าน (req.auth = { uid, role } แต่ไม่ถูกใช้ต่อเลย)
        Backend->>Backend: getStaffQuerySchema.parse(query): page, limit, merchantId?, role?, username?, status?, startDate?, endDate?, query? (ทุกตัวเป็น optional)
        Note over Backend: ไม่มีการเอา req.auth.uid/role มาบังคับ filter merchantId ใด ๆ — merchantId เป็นแค่ query param ที่ client ส่งมาเอง ไม่ส่งก็ได้
        Backend->>Database: SELECT staff LEFT JOIN merchants LEFT JOIN staffRole LEFT JOIN role WHERE (เงื่อนไขจาก filter ที่ส่งมา ถ้าไม่ส่ง merchantId คือไม่มี WHERE merchantId เลย) LIMIT :limit OFFSET (page-1)*limit
        Backend->>Database: SELECT count(*) ด้วย join/where ชุดเดียวกัน (สำหรับ total)
        Database-->>Backend: staff rows ของ "ทุก merchant ในระบบ" (ถ้าไม่ส่ง merchantId) + total
        Backend-->>FrontEnd: 200 { items: [{ id, merchantId, name, role, username, status, createdAt, merchantName }], total, page, limit }
        FrontEnd->>FrontEnd: setStaffList(items); setTotal(total)
        FrontEnd->>User: render DataTable (server-side pagination ผ่าน page/limit/total) + FilterBar (merchantId เป็นแค่ text input ให้กรอก uid เอง)
    end

    User->>FrontEnd: คลิกดู/ยิงตรง GET /staff/:id (ถ้ามี)
    FrontEnd->>Backend: GET /staff/:id (cookie: token)
    Backend->>Backend: authMiddleware: jwt.verify(...)
    alt ไม่ผ่าน
        Backend-->>FrontEnd: 401
    else ผ่าน (ไม่เช็คว่า staff ที่ login อยู่มีสิทธิ์ดู id นี้หรือไม่)
        Backend->>Database: SELECT staff LEFT JOIN staffRole LEFT JOIN role WHERE staff.uid = :id LIMIT 1 (เลือกแค่ uid, merchantId, name, role — ไม่ select username/status/createdAt/merchantName)
        alt ไม่พบ
            Backend-->>FrontEnd: 404 { message: "Staff member not found" }
        else พบ
            Backend-->>FrontEnd: 200 { id, merchantId, name, role, username: undefined, status: undefined, createdAt: undefined, merchantName: undefined }
        end
    end
```

## สิ่งที่ต่างจาก "มาตรฐานที่ควรมี"

โค้ดปัจจุบัน (`apps/portal-service/src/presentation/routes/staff.routes.ts`, `StaffController.getAll/getById`, `GetStaffUseCase`, `GetStaffDetailUseCase`, `DrizzleStaffRepository`, และฝั่ง client `apps/portal/src/app/(authenticated)/staff/page.tsx`) มีพฤติกรรมดังนี้:

| ประเด็น | ที่เป็นอยู่จริง | มาตรฐานที่ควรมี | เหตุผล |
|---|---|---|---|
| Auth | `GET /staff` และ `GET /staff/:id` mount ใต้ `requireAuth` ใน `index.ts` (`app.use('/', requireAuth, staffRoutes(staffController))`) ต้องมี cookie `token` valid | เหมือนเดิม (มี auth แล้ว) | ป้องกันคนไม่ login เรียก API ตรง ๆ |
| Authorization (IDOR / data scoping) | `merchantId` เป็นแค่ query param ที่ client เลือกส่งเองหรือไม่ส่งก็ได้ ไม่ได้ผูกกับ `req.auth` เลย ทำให้ staff ที่ login (ไม่ว่า role ไหนของ merchant ไหน) เรียก `GET /staff` เฉย ๆ (ไม่ใส่ merchantId) แล้วเห็น staff **ทุกคนของทุก merchant ในระบบ** ได้ทันที รวม username และ merchant ที่สังกัด | ควร derive scope จาก `req.auth` เสมอ เช่น ถ้าไม่ใช่ super admin ต้อง force filter `merchantId = staff ที่ login สังกัดอยู่` ฝั่ง backend และไม่ยอมให้ query param override ได้ | เป็นช่องโหว่ IDOR/data-leak ชัดเจน: staff ร้าน A เห็นรายชื่อ+username พนักงานร้าน B, C, ... ได้หมดโดยไม่ต้องแฮ็กอะไรเลย แค่ล้าง filter merchant UID ในหน้า UI |
| Authorization ของ `/staff/:id` | `getById` ไม่เช็คว่า staff ที่ login มีสิทธิ์ดู id นี้หรือไม่ ใส่ uid staff คนไหนก็ query ได้ถ้า login อยู่ | ควรเช็คว่า staff เป้าหมายอยู่ merchant เดียวกับผู้เรียก หรือผู้เรียกเป็น super admin ก่อนตอบข้อมูล | ป้องกัน IDOR รายบุคคล: เดา/enumerate uid staff แล้วดูข้อมูลของพนักงานร้านอื่นได้ |
| ความสอดคล้องของข้อมูล (list vs detail) | `DrizzleStaffRepository.getStaffById` select แค่ `uid, merchantId, name, role` แต่ `toStaffResponseDto`/`StaffResponseDto` ประกาศฟิลด์ `username, status, createdAt, merchantName` ด้วย → ฟิลด์เหล่านี้จะเป็น `undefined` เสมอใน response ของ `/staff/:id` ทั้งที่ `/staff` (list) มีข้อมูลครบ | endpoint detail ควร select ครบทุก field ที่ response DTO ประกาศไว้ ให้ตรงกับ list endpoint | client ที่คาดหวัง username/status/createdAt จากหน้า detail จะได้ `undefined` แล้วต้องไปพึ่งข้อมูลจาก list แทน เป็นความไม่สอดคล้องที่ debug ยาก |
| Pagination | `GET /staff` มี pagination จริง (`page/limit` ส่งไป backend, backend query ด้วย `LIMIT/OFFSET` และมี `count()` แยกสำหรับ `total`) | เหมือนเดิม (ทำถูกแล้วในจุดนี้) | ต่างจากหน้า merchants list ที่ query ทุกแถวมาที่ client แล้ว paginate เอง หน้านี้ทำ server-side pagination ได้ถูกต้อง |
| Rate limit / Audit log | ไม่มีการจำกัด rate หรือ log ว่าใครดู staff list/detail ของ merchant ไหนบ้าง | ควรมี audit log อย่างน้อยตอนดู PII เช่น username ของพนักงานร้านอื่น | ใช้ตรวจสอบย้อนหลังเมื่อพบว่ามีการดึงข้อมูล staff ข้าม merchant จำนวนมากผิดปกติ |
