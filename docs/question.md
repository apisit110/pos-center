# Questions (portal-service)

## Backend round 2

Raised while coding portal-service against the new docs. Each item below is implemented in the simplest way the docs allow (stated per item) or skipped; please confirm or correct.

- `GET /api/v1/transactions` for non-`PRODUCT_OWNER`: doc says `transactions.merchant_id` = "merchant id". I compare it with the merchant `mid` (that is what pos-sync-service stores from the pos `merchant_id`), not the merchant uid or the numeric id. Correct?
- `POST /api/v1/store-products/batch` with the same (store, product) twice inside one chunk of 500 rows and not yet in the store: implemented as the first row = `created`, the next rows = `updated` (last values win), same as when the rows are in different chunks. OK? (There is no unique constraint on `store_products (store_id, product_id)` in the schema; should one be added?)
- `POST /api/v1/store-products/batch` with a row where both `store_uid` and `product_uid` are not found: only the store error is reported for that row (one error per row). Should both be reported?
- Existing databases need `pnpm --filter @pos-center/database db:seed` to get the new permission `store_products:create` and its mapping to `PRODUCT_OWNER` (no migration holds permission data, only the seed). Is there any other deployment step you want for this?
