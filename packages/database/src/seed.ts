import { db } from './index';
import { merchants, stores, products, storeProducts, members, staff, runningNumbers, syncMetadata } from '@lightning/models';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function seed() {
  console.log('🌱 Seeding database...');

  const dataPath = path.join(__dirname, '../../../apps/portal/public/constants');

  try {
    // 1. Seed Merchants
    const merchantsData = JSON.parse(fs.readFileSync(path.join(dataPath, 'master_merchant.json'), 'utf8'));
    console.log(`📦 Seeding ${merchantsData.length} merchants...`);
    for (const merchant of merchantsData) {
      await db.insert(merchants).values({
        id: merchant.id,
        name: merchant.name,
      }).onConflictDoUpdate({
        target: merchants.id,
        set: { name: merchant.name }
      });
    }

    // 2. Seed Stores
    const storesData = JSON.parse(fs.readFileSync(path.join(dataPath, 'master_store.json'), 'utf8'));
    console.log(`📦 Seeding ${storesData.length} stores...`);
    for (const store of storesData) {
      await db.insert(stores).values({
        uid: store.id,
        merchantId: store.merchant_id,
        name: store.name,
        address: store.address,
        latitude: store.latitude?.toString(),
        longitude: store.longitude?.toString(),
      }).onConflictDoUpdate({
        target: stores.uid,
        set: { 
          name: store.name,
          merchantId: store.merchant_id,
          address: store.address,
          latitude: store.latitude?.toString(),
          longitude: store.longitude?.toString(),
        }
      });
    }

    // 3. Seed Products
    const productsData = JSON.parse(fs.readFileSync(path.join(dataPath, 'master_product.json'), 'utf8'));
    console.log(`📦 Seeding ${productsData.length} products...`);
    
    // We'll process products in chunks to be safe, although 2k is small.
    // Also track UID -> ID mapping for storeProducts
    const productUidToId: Record<string, number> = {};
    
    for (const product of productsData) {
      const inserted = await db.insert(products).values({
        uid: product.uid,
        merchantId: product.merchant_id,
        name: product.name_th || product.name_en || 'Unnamed Product',
        sku: product.sku || null,
        barcode: product.barcode || null,
        basePrice: product.base_price?.toString() || '0',
        imageUrl: product.image_url,
        brand: product.brand_th || product.brand_en || null,
        unitName: product.unit_name || null,
      }).onConflictDoUpdate({
        target: products.uid,
        set: {
          name: product.name_th || product.name_en || 'Unnamed Product',
          basePrice: product.base_price?.toString() || '0',
          imageUrl: product.image_url,
          barcode: product.barcode || null,
          brand: product.brand_th || product.brand_en || null,
          unitName: product.unit_name || null,
        }
      }).returning({ id: products.id, uid: products.uid });
      
      if (inserted[0]) {
        productUidToId[inserted[0].uid] = inserted[0].id;
      }
    }

    // 4. Seed Store Products
    const storeProductsData = JSON.parse(fs.readFileSync(path.join(dataPath, 'master_store_product.json'), 'utf8'));
    console.log(`📦 Seeding ${storeProductsData.length} store products...`);
    
    // Need store internal IDs
    const allStores = await db.select().from(stores);
    const storeUidToId: Record<string, number> = {};
    allStores.forEach(s => storeUidToId[s.uid] = s.id);

    for (const sp of storeProductsData) {
      const storeId = storeUidToId[sp.store_id];
      const productId = productUidToId[sp.product_id];
      
      if (!storeId || !productId) {
        // If product was already there, we might not have it in productUidToId if 'returning' didn't run or something
        // But with onConflictDoUpdate + returning it should work.
        // Let's do a fallback lookup if missing.
        if (!productId) {
            const foundProduct = await db.select({ id: products.id }).from(products).where(eq(products.uid, sp.product_id)).limit(1);
            if (foundProduct[0]) {
                productUidToId[sp.product_id] = foundProduct[0].id;
            } else {
                console.warn(`⚠️ Skipping StoreProduct ${sp.id}: product ${sp.product_id} not found in DB`);
                continue;
            }
        }
      }

      await db.insert(storeProducts).values({
        uid: sp.id,
        storeId,
        productId,
        stock: sp.stock || 0,
        price: sp.price?.toString() || '0',
        priceTiers: sp.price_tiers,
        unit: sp.unit || null,
      }).onConflictDoUpdate({
        target: storeProducts.uid,
        set: {
          stock: sp.stock || 0,
          price: sp.price?.toString() || '0',
          priceTiers: sp.price_tiers,
        }
      });
    }

    // 4. Seed Store Products
    // ... (existing code for store products) ...
    // ...

    // 5. Seed Members
    console.log('📦 Seeding members...');
    const dummyMembers = [
      { uid: 'mem-1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '0812345678', tier: 'Gold', points: 1500 },
      { uid: 'mem-2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '0812345679', tier: 'Silver', points: 800 },
      { uid: 'mem-3', firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', phone: '0812345680', tier: 'Platinum', points: 5000 },
      { uid: 'mem-4', firstName: 'Bob', lastName: 'Brown', email: 'bob@example.com', phone: '0812345681', tier: 'Bronze', points: 100 },
      { uid: 'mem-5', firstName: 'Charlie', lastName: 'Davis', email: 'charlie@example.com', phone: '0812345682', tier: 'Gold', points: 2000 },
    ];
    for (const m of dummyMembers) {
      await db.insert(members).values(m).onConflictDoUpdate({
        target: members.uid,
        set: m
      });
    }

    // 6. Seed Staff
    console.log('📦 Seeding staff...');
    const allMerchants = await db.select().from(merchants);
    if (allMerchants.length > 0) {
      const dummyStaff = [
        { uid: 'staff-1', merchantId: allMerchants[0].id, name: 'Staff Member 1', role: 'Manager' },
        { uid: 'staff-2', merchantId: allMerchants[0].id, name: 'Staff Member 2', role: 'Cashier' },
        { uid: 'staff-3', merchantId: allMerchants[0].id, name: 'Staff Member 3', role: 'Cashier' },
        { uid: 'staff-4', merchantId: (allMerchants[1] || allMerchants[0]).id, name: 'Staff Member 4', role: 'Manager' },
        { uid: 'staff-5', merchantId: (allMerchants[1] || allMerchants[0]).id, name: 'Staff Member 5', role: 'Cashier' },
      ];
      for (const s of dummyStaff) {
        await db.insert(staff).values(s).onConflictDoUpdate({
          target: staff.uid,
          set: s
        });
      }
    }

    // 7. Seed Running Numbers
    console.log('📦 Seeding running numbers...');
    await db.insert(runningNumbers).values({
      type: 'product_version',
      number: 0
    }).onConflictDoNothing();

    // 8. Seed Sync Metadata
    console.log('📦 Seeding sync metadata...');
    await db.insert(syncMetadata).values({
      lastProductSyncVersion: 0,
      status: 'IDLE'
    }).onConflictDoNothing();

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
