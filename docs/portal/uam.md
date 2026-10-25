# UAM Cashier

User Access Management (UAM)

| Action           | Guest | Manager | Cashier |
| ---------------- | ----- | ------- | ------- |
| login            | [x]   | [ ]     | [ ]     |
| dashboard:view   | [ ]   | [x]     | [ ]     |
| sell:create      | [ ]   | [x]     | [x]     |
| transaction:view | [ ]   | [x]     | [ ]     |
| products:view    | [ ]   | [x]     | [ ]     |
| product:create   | [ ]   | [x]     | [ ]     |
| product:edit     | [ ]   | [x]     | [ ]     |
| products:sync    | [ ]   | [x]     | [ ]     |
| staff:view       | [ ]   | [x]     | [ ]     |
| staff:create     | [ ]   | [x]     | [ ]     |

# UAM Cashier Center

User Access Matrix หรือ ตารางกำหนดสิทธิ์การเข้าถึงของผู้ใช้ ใช้สำหรับการ บริหารจัดการและควบคุมสิทธิ์การเข้าถึงระบบ

| Role/Permission         | Product Owner |
| ----------------------- | ------------- |
| me:get_profile          | x             |
| dashboard:view          | x             |
| merchants:view          | x             |
| merchants:create        | x             |
| merchant_detail:view    | x             |
| merchant_credentials:create | x         |
| merchant_credentials:rotate | x         |
| stores:view             | x             |
| stores:create           | x             |
| store_detail:view       | x             |
| products:view           | x             |
| products:create         | x             |
| store_products:create   | x             |
| product_detail:view     | x             |
| members:view            | x             |
| member_detail:view      | x             |
| staffs:view             | x             |
| staffs:create           | x             |
| staff_detail:view       | x             |
| transactions:view       | x             |
| transaction_detail:view | x             |
| terminals:view          | x             |
| terminals:create        | x             |
