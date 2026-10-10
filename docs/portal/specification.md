# Agents

## Project manager

documentation: docs/agents/project-manager.md

## Senior Software Engineer

documentation: docs/agents/senior-software-engineer.md



# Rules

- หากมีข้อสงสัยให้ ห้ามตัดสินใจเอง ให้เขียนเป็นข้อไว้ในไฟล์ docs/question.md


# Variables

app_id: APP0001


# API Specification

## Auth - login

documentation: docs/portal/flow/auth/post-login.md


## Auth - logout

documentation: docs/portal/flow/auth/post-logout.md
Method: POST
Path: /logout
request: {

}
response: {

}

## Auth - Get Profile

documentation: docs/portal/flow/auth/get-profile.md
Method: GET
Path: /me
request: {

}
response: {

}

## Merchant - List Merchant

documentation: docs/portal/flow/merchant/get-merchants.md
Method: GET
Path: /merchants

## Merchant - Merchant Detail Staff

documentation: docs/portal/flow/merchant/get-merchant-detail-staff.md
Method: GET
Path: /merchants/:id/staff

## Merchant - Merchant Detail

documentation: docs/portal/flow/merchant/get-merchant-detail.md
Method: GET
Path: /merchants/:id

## Merchant - Create Merchant

documentation: docs/portal/flow/merchant/post-merchant.md
Method: POST
Path: /merchants

## Product - List Product

documentation: docs/portal/flow/merchant/get-products.md
Method: GET
Path: /products

## Product - MetaData

Select Option Values - Brand
Select Option Values - Unit

Method: GET
Path: /products/metadata

## Product - Create Product - Batch

Method: POST
Path: /products/batch

## Product - Create Product - Keyin

Method: POST
Path: /products

## Product - Product Detail

Method: GET
Path: /products/:id


## Stores Product - Add products to store

Method: POST
Path: /store-products/batch


## Stores - List Store

Method: GET
Path: /stores

## Stores - Store Detail

Method: GET
Path: /stores/:id

## Stores - Store Detail - Terminal

Method: GET
Path: /stores/:id/terminals


## Staff - List Staff

Method: GET
Path: /staff

## Staff - Staff Detail

Method: GET
Path: /staff/:id

## transactions

Method: GET
Path: /transactions