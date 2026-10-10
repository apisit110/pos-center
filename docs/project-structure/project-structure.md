# Project Structure

follow clean architecture 4 layer

## Dependency Rule

```
presentation ──▶ application ──▶ domain ◀── infrastructure
```

- `domain` ไม่ import อะไรจาก layer อื่น (pure TypeScript)
- `application` พึ่งพา `domain` เท่านั้น (เรียก repository ผ่าน interface)
- `infrastructure` implement interface ที่ประกาศไว้ใน `domain`
- `presentation` เรียก `application` (use case) ห้ามเรียก `infrastructure` ตรงๆ
- การประกอบ dependency (composition root) ทำที่ `src/index.ts` เท่านั้น

## Folder Layout

```
apps/portal-service/src
├── index.ts                      # composition root: new repo → new use case → new controller → routes
├── domain
│   ├── constants
│   │   └── roles.ts              # ค่าคงที่ของ domain เช่น role
│   ├── entities
│   │   └── <Name>.ts             # Merchant, Store, Staff, Terminal, Product, StoreProduct, Transaction
│   └── repositories
│       └── I<Name>Repository.ts  # interface ของ repository (ไม่มี implementation)
├── application
│   ├── usecases
│   │   └── <Action><Name>UseCase.ts   # 1 use case = 1 ไฟล์ = 1 method execute()
│   └── errors
│       ├── CommonErrors.ts       # NotFoundError ฯลฯ
│       └── AuthErrors.ts
├── infrastructure
│   ├── repositories
│   │   └── Drizzle<Name>Repository.ts # implement I<Name>Repository ด้วย Drizzle ORM
│   ├── services
│   │   └── RunningNumberService.ts    # service ที่ต้องพึ่ง resource ภายนอก (DB)
│   └── utils
│       └── date.ts
└── presentation
    ├── routes
    │   └── <name>.routes.ts      # กำหนด path + middleware แล้วส่งต่อให้ controller
    ├── controllers
    │   └── <Name>Controller.ts   # รับ req → เรียก use case → ส่ง res
    ├── middleware
    │   ├── AuthMiddleware.ts     # ตรวจ JWT
    │   ├── RbacMiddleware.ts     # ตรวจสิทธิ์ / ความเป็นเจ้าของ merchant
    │   ├── LoggerMiddleware.ts
    │   └── ErrorMiddleware.ts    # แปลง error → HTTP response
    └── dtos
        ├── request               # <Action><Name>RequestDto / Get<Name>QueryDto
        └── response              # <Name>ResponseDto, PaginatedResponseDto
```

## Layers

### 1. domain
หัวใจของระบบ ไม่ขึ้นกับ framework, database หรือ HTTP

| โฟลเดอร์ | หน้าที่ | ตัวอย่าง |
|---|---|---|
| `entities` | โครงสร้างข้อมูลและกฎของธุรกิจ | `Store.ts`, `Staff.ts` |
| `repositories` | interface สำหรับเข้าถึงข้อมูล | `IStoreRepository.ts` |
| `constants` | ค่าคงที่ของ domain | `roles.ts` |

### 2. application
ลอจิกของ use case แต่ละอย่าง

- ชื่อไฟล์: `<Verb><Noun>UseCase.ts` เช่น `CreateStoreUseCase`, `GetStoresUseCase`
- รับ repository interface ผ่าน constructor, มี method `execute()` เดียว
- throw error จาก `errors/` (เช่น `NotFoundError`) แทนการส่ง HTTP status
- ห้าม import `express`, `drizzle` หรืออะไรที่เป็นรายละเอียดภายนอก

```ts
export class GetStoresUseCase {
  constructor(
    private storeRepository: IStoreRepository,
    private merchantRepository: IMerchantRepository
  ) {}

  async execute(merchantId?: string): Promise<Store[]> { ... }
}
```

### 3. infrastructure
รายละเอียดทางเทคนิคที่เปลี่ยนได้โดยไม่กระทบ domain

- `repositories/Drizzle<Name>Repository.ts` implement interface จาก `domain/repositories`
- `services/` สำหรับ service ที่ต้องใช้ resource ภายนอก
- `utils/` ฟังก์ชันช่วยเหลือที่ไม่เกี่ยวกับ business

### 4. presentation
ชั้นติดต่อกับ client (HTTP)

- `routes` → `controllers` → use case
- `middleware` จัดการ cross-cutting concern (auth, rbac, logging, error)
- `dtos/request` และ `dtos/response` แยก shape ของ API ออกจาก entity

```ts
export function storeRoutes(controller: StoreController, staffRepository: IStaffRepository): Router {
  router.get('/stores', ownershipByMerchantIdQuery, (req, res, next) => controller.getAll(req, res, next));
}
```

## Naming Convention

| ชนิด | รูปแบบ | ตัวอย่าง |
|---|---|---|
| Entity | `PascalCase.ts` | `StoreProduct.ts` |
| Repository interface | `I<Name>Repository.ts` | `IStoreRepository.ts` |
| Repository impl | `Drizzle<Name>Repository.ts` | `DrizzleStoreRepository.ts` |
| Use case | `<Verb><Noun>UseCase.ts` | `CreateStaffUseCase.ts` |
| Controller | `<Name>Controller.ts` | `StaffController.ts` |
| Routes | `<name>.routes.ts` | `storeProduct.routes.ts` |
| Request DTO | `<Action><Name>RequestDto.ts` / `Get<Name>QueryDto.ts` | `LoginRequestDto.ts` |
| Response DTO | `<Name>ResponseDto.ts` | `StoreResponseDto.ts` |
| Middleware | `<Name>Middleware.ts` | `AuthMiddleware.ts` |

## เพิ่ม Feature ใหม่ (Checklist)

1. `domain/entities/<Name>.ts` และ `domain/repositories/I<Name>Repository.ts`
2. `application/usecases/<Verb><Name>UseCase.ts`
3. `infrastructure/repositories/Drizzle<Name>Repository.ts`
4. `presentation/dtos/request|response/...`
5. `presentation/controllers/<Name>Controller.ts` และ `presentation/routes/<name>.routes.ts`
6. ประกอบ dependency และลงทะเบียน route ใน `src/index.ts`
