import { db } from './index';
import { merchants, stores, products } from '@lightning/models';

async function main() {
  console.log('🌱 Seeding database...');

  // Example seeding logic
  console.log('Inserting default merchant...');
  const [merchant] = await db.insert(merchants).values({
    name: 'Main Merchant',
  }).returning();

  console.log(`Inserted merchant: ${merchant.name} (${merchant.id})`);

  if (merchant) {
    console.log('Inserting default store...');
    await db.insert(stores).values({
      merchantId: merchant.id,
      name: 'Central Store',
    });
  }

  console.log('✅ Seeding completed');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seeding failed');
  console.error(err);
  process.exit(1);
});
