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

<!-- pnpm --filter @pos-center/database db:seed -->

---

| Action                    | Manager | XXX |
| ------------------------- | ------- | --- |
| View Merchant             | [ ]     | [ ] |
| Create Merchant           | [ ]     | [ ] |
| View Stores               | [ ]     | [ ] |
| Create Stores             | [ ]     | [ ] |
| View Product              | [ ]     | [ ] |
| Create Product            | [ ]     | [ ] |
| View Map Store Products   | [ ]     | [ ] |
| Create Map Store Products | [ ]     | [ ] |
| View Members              | [ ]     | [ ] |
| View Staffs               | [ ]     | [ ] |
| View Transactions         | [ ]     | [ ] |

---

todos

[ ] - upupdate product price of store
 


----

todos

[ ] - add product detail to master_product_2.json
    - use unused_product_images.json for more information to checking
[ ] - create master_store_product_2.json



center
admin
123456 admin

cashier
00010001
123456

---

```bash
docker compose -f ./docker-compose-dev.yml up
```