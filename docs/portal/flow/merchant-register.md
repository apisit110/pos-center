# Merchant Register Flow (ของจริงในโค้ดปัจจุบัน)

```mermaid
sequenceDiagram
    actor User
    participant FrontEnd as FrontEnd (CreateMerchantPage /merchants/new)
    participant Backend as Backend (MerchantController.register)
    participant Database

    User->>FrontEnd: กรอกฟอร์ม (merchantName, staffMembers[], stores[]+terminals[])
    FrontEnd->>FrontEnd: validate เฉพาะฝั่ง client: pin === confirmPin ทุกคน, ต้องมี staff อย่างน้อย 1 คน role=manager
    FrontEnd->>FrontEnd: ตัด confirmPin ออกจาก payload ก่อนส่ง
    FrontEnd->>Backend: POST /merchants (cookie: token, body: { merchantName, staffMembers, stores })
    Backend->>Backend: authMiddleware: jwt.verify(cookie "token", JWT_SECRET)

    alt ไม่มี/หมดอายุ/ผิด token
        Backend-->>FrontEnd: 401 { message: "Unauthorized" }
    else verify ผ่าน (ไม่เช็ค role เลย)
        Note over Backend: ทุก staff ที่ login ได้ (ไม่ว่า role manager/cashier ของ merchant ไหนก็ตาม) เรียก POST /merchants สร้าง merchant ใหม่ได้หมด
        Backend->>Backend: registerMerchantSchema.parse(body) (zod)
        alt validation ไม่ผ่าน (เช่น merchantName ว่าง, staff.pin ว่าง, role ไม่ใช่ manager/cashier)
            Backend-->>FrontEnd: error (ผ่าน errorMiddleware, ไม่ใช่ custom 400 message)
        else validate ผ่าน
            Note over Backend: schema ไม่บังคับว่าต้องมี staffMembers อย่างน้อย 1 คน หรือต้องมี role=manager อย่างน้อย 1 คน (เช็คแค่ฝั่ง client เท่านั้น)
            Backend->>Backend: RegisterMerchantUseCase.execute(request)
            Backend->>Backend: merchantUid = uuidv4()
            Backend->>Database: RunningNumberService.nextMid() -> INSERT/UPDATE running_numbers (type='mid') แล้ว SELECT กลับมา (2 query แยกกัน ไม่อยู่ใน transaction เดียวกับงานอื่น)
            Database-->>Backend: mid (4 หลัก)
            Backend->>Database: INSERT INTO merchants (uid, mid, name) ON CONFLICT(uid) DO UPDATE
            Database-->>Backend: ok
            loop สำหรับแต่ละ staffMembers[i]
                Backend->>Database: nextStaffUsername(mid) -> running_numbers (type='staff:<mid>')
                Backend->>Backend: bcrypt.hash(pin, 10)
                Backend->>Database: DrizzleStaffRepository.save(): tx { INSERT/UPDATE staff, upsert role, upsert staffRole, upsert pins(pinHash) }
                Note over Backend,Database: แต่ละ staff เป็น transaction แยกของตัวเอง ไม่ได้รวมกับการสร้าง merchant ใน transaction เดียว
            end
            loop สำหรับแต่ละ stores[j]
                Backend->>Database: nextSid(mid) -> running_numbers (type='sid:<mid>')
                Backend->>Database: INSERT INTO stores (uid, sid, merchantUid, mid, name, address, lat, lng)
                loop สำหรับแต่ละ terminals[k] ของ store นี้
                    Backend->>Database: nextTid(sid) -> running_numbers (type='tid:<sid>')
                    Backend->>Database: INSERT INTO terminals (uid, storeUid, tid, name)
                end
            end
            alt insert ใด ๆ ระหว่างทาง throw error (เช่น merchant ซ้ำ, DB error)
                Backend-->>FrontEnd: error ผ่าน errorMiddleware (merchant/staff/store ที่ insert ไปแล้วก่อนหน้ายังอยู่ใน DB ไม่ rollback)
            else ทำครบทุก insert
                Backend-->>FrontEnd: 201 { uid, mid, name } (ไม่มีข้อมูล staff/stores/terminals ที่เพิ่งสร้างใน response)
            end
        end
    end

    alt request สำเร็จ (201)
        FrontEnd->>FrontEnd: router.push('/merchants'); router.refresh()
    else error (401/validation/500 ฯลฯ)
        FrontEnd->>User: alert('Failed to create merchant') (ข้อความเดียวกันหมดไม่ว่า error อะไร)
    end
```

## สิ่งที่ต่างจาก "มาตรฐานที่ควรมี"

โค้ดปัจจุบัน (`apps/portal-service/src/presentation/routes/merchant.routes.ts`, `MerchantController.register`, `RegisterMerchantUseCase`, `DrizzleStaffRepository.save`, `RunningNumberService`, และฝั่ง client `apps/portal/src/app/(authenticated)/merchants/new/page.tsx`) มีพฤติกรรมดังนี้:

| ประเด็น | ที่เป็นอยู่จริง | มาตรฐานที่ควรมี | เหตุผล |
|---|---|---|---|
| Auth | `POST /merchants` ถูก mount ใต้ `requireAuth` เหมือน route อื่นใน `merchant.routes.ts` (ไม่ใช่ public route) จึงต้องมี cookie `token` ที่ valid | เหมือนเดิม (มี auth แล้ว) | ป้องกันคนไม่ login ยิง API ตรง ๆ ได้ |
| Authorization (RBAC) | authMiddleware เช็คแค่ token valid ไม่เช็ค `req.auth.role` เลย ทุก staff ที่ login ได้ (รวมถึง role cashier ของ merchant อื่น) เรียก `POST /merchants` เพื่อสร้าง merchant ใหม่ทั้งระบบได้ | ควรจำกัดว่ามีแค่ role ระดับสูง (เช่น super admin/owner) เท่านั้นที่สร้าง merchant ใหม่ได้ | การสร้าง merchant คือ operation ระดับระบบ ไม่ควรเปิดให้ staff ระดับ cashier ของร้านใด ๆ ทำได้ |
| Business rule ต้องมี manager | ฝั่ง client บังคับว่าต้องมี staff อย่างน้อย 1 คน role=manager ก่อน submit แต่ backend (`registerMerchantSchema`, `RegisterMerchantUseCase`) ไม่ได้บังคับเลย — ยิง API ตรง ๆ ด้วย `staffMembers: []` หรือมีแต่ cashier ก็สร้าง merchant สำเร็จได้ | rule ทางธุรกิจต้อง validate ที่ backend เสมอ ไม่ใช่พึ่งฝั่ง client อย่างเดียว | client-side validation ข้ามได้ง่าย (เรียก API ตรง ๆ ด้วย curl/Postman) ทำให้ได้ merchant ที่ไม่มีใคร login เข้าใช้งานได้เลย |
| Atomicity / Transaction | การสร้าง merchant, staff แต่ละคน, store แต่ละร้าน, terminal แต่ละตัว เป็นการ insert แยกกันหลายรอบ (แต่ละ `staffRepository.save()` มี transaction ของตัวเอง) ไม่ได้ครอบทั้งหมดด้วย transaction เดียว | ทั้ง flow การสมัคร merchant ควรอยู่ใน DB transaction เดียว แล้ว rollback ทั้งหมดถ้าขั้นตอนใดขั้นตอนหนึ่ง fail | ถ้า insert store หรือ terminal ตัวท้าย ๆ fail จะเหลือ merchant + staff ที่ insert ไปแล้วค้างอยู่ใน DB กลายเป็นข้อมูลครึ่ง ๆ กลาง ๆ (partial write) |
| Race condition ของ running number | `RunningNumberService.next()` ทำ `INSERT ... ON CONFLICT DO UPDATE` แล้วค่อย `SELECT` แยกอีก query หนึ่งเพื่ออ่านค่ากลับมา ไม่ได้อยู่ใน transaction/lock เดียวกับการใช้เลขนั้นไป insert merchant/store/terminal | ควรใช้ atomic operation เดียว (เช่น `UPDATE ... RETURNING`) หรือครอบด้วย transaction + row lock เพื่อรับประกันว่าเลขที่ได้จะไม่ซ้ำและไม่มีใคร insert แทรกระหว่างกลาง | ถ้ามี request สมัคร merchant พร้อมกันสองอันในเวลาใกล้เคียงกัน มีโอกาส race แล้วได้ mid/sid/tid/username ซ้ำกัน หรือ insert ไปใช้เลขที่ query กลับมาช้ากว่าคนอื่น |
| Error handling | ทุก error (401, validation error, DB error) ฝั่ง frontend แสดงข้อความเดียวกันหมดคือ `alert('Failed to create merchant')` | ควรแยกข้อความตามประเภท error เช่น validation error แสดง field ที่ผิด, 401 ให้ redirect ไป login | ผู้ใช้และทีม support ไม่รู้ว่า fail เพราะอะไร ต้องเดา/เปิด console log เอง |
| Response payload | `POST /merchants` สำเร็จ (201) ตอบแค่ `{ uid, mid, name }` ไม่มีข้อมูล staff/store/terminal ที่เพิ่งสร้าง | ควร response กลับมาว่าสร้าง staff/store/terminal อะไรไปบ้าง (อย่างน้อย uid/username ของแต่ละ staff) | frontend/ผู้ดูแลระบบไม่รู้ username ที่ระบบ gen ให้ staff แต่ละคนจนกว่าจะไปเปิดหน้า staff list แยกต่างหาก |
| Audit log | ไม่มีการบันทึกว่า staff คนไหน (จาก `req.auth.uid`) เป็นคนสร้าง merchant นี้ | ควร log ผู้สร้าง merchant พร้อม timestamp | ใช้ตรวจสอบย้อนหลังกรณีมีการสร้าง merchant ปลอมหรือผิดปกติ |
