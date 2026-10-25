# Agents

## Senior Frontend Engineer

documentation: docs/agents/senior-frontend-engineer.md

## Senior Backend Engineer

documentation: docs/agents/senior-backend-engineer.md






# Product Structure

documentation: docs/project-structure/project-structure.md





# Variables

app_id:

- `APP0001` = cashier, username คือ `cashier_staff.username`
- `APP0002` = center, username คือ `center_staff.username`


# Code style

- internal variable `camelCase`
- external variable like request payload, response body `snake_case`

# Date and time

- client and backend communicate date time in UTC+0 (ISO 8601, e.g. `2026-01-01T00:00:00.000Z`), stored in database as UTC
- a date filter `YYYY-MM-DD` (e.g. `start_date`, `end_date`) is a calendar date in `Asia/Bangkok` (UTC+7): start of day is `00:00:00.000+07:00`, end of day is `23:59:59.999+07:00`
- portal displays date time in `Asia/Bangkok`





# API Specification

## Auth - login

documentation: docs/portal/flow/auth/post-login.md

## Auth - logout

documentation: docs/portal/flow/auth/post-logout.md

## Auth - Get Profile

documentation: docs/portal/flow/auth/get-profile.md

## Merchant - List Merchant

documentation: docs/portal/flow/merchant/get-merchants.md

## Merchant - Merchant Detail Staff

documentation: docs/portal/flow/merchant/get-merchant-detail-staff.md

## Merchant - Merchant Detail

documentation: docs/portal/flow/merchant/get-merchant-detail.md

## Merchant - Create Merchant

documentation: docs/portal/flow/merchant/post-merchant.md

## Merchant - Create Merchant Credential

documentation: docs/portal/flow/merchant/post-merchant-credential.md

## Merchant - Rotate Merchant Credential

documentation: docs/portal/flow/merchant/post-merchant-credential-rotate.md

## Product - List Product

documentation: docs/portal/flow/product/get-products.md

## Product - MetaData

documentation: docs/portal/flow/product/get-products-metadata.md

## Product - Create Product - Batch

documentation: docs/portal/flow/product/post-products-batch.md

## Product - Create Product - Keyin

documentation: docs/portal/flow/product/post-product.md

## Product - Product Detail

documentation: docs/portal/flow/product/get-product-detail.md

## Stores Product - Add products to store

documentation: docs/portal/flow/store-product/post-store-products-batch.md

## Stores - List Store

documentation: docs/portal/flow/store/get-stores.md

## Stores - Store Detail

documentation: docs/portal/flow/store/get-store-detail.md

## Stores - Store Detail - Terminal

documentation: docs/portal/flow/store/get-store-terminals.md

## Staff - List Staff

documentation: docs/portal/flow/staff/get-staffs.md

## Staff - Staff Detail

documentation: docs/portal/flow/staff/get-staff-detail.md

## Transaction - List Transaction

documentation: docs/portal/flow/transaction/get-transactions.md

# API Specification Sync Service

## Auth - Issue Sync Token

documentation: docs/sync/flow/authentication.md

## Pull - Cashier Profile (merchant, store, terminal, staff)

documentation: docs/sync/flow/pull-cashier-profile.md

## Pull - Products

documentation: docs/sync/flow/pull-products.md

## Pull - Orders

documentation: (not yet implemented)

## Pull - Transactions

documentation: (not yet implemented)

## Push - Orders

documentation: docs/sync/flow/push-order.md

## Push - Transactions

documentation: docs/sync/flow/push-transaction.md

## Push - Products (create / edit)

documentation: docs/sync/flow/push-products.md
