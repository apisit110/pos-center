const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'apps/portal/public/constants/product_master.json');
const newPath = path.join(__dirname, 'apps/portal/public/constants/master_product.json');

const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const updatedProducts = products.map(p => ({ ...p, merchant_id: 1 }));

fs.writeFileSync(newPath, JSON.stringify(updatedProducts, null, 2));
fs.unlinkSync(filePath);
console.log('Transformed and renamed product_master.json to master_product.json');
