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
