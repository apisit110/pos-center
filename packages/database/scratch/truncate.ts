import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || 'postgres://lightning:lightning@localhost:5432/lightning_pos';
const sql = postgres(connectionString);

async function truncate() {
  console.log('🗑️ Truncating all tables...');
  try {
    await sql`TRUNCATE TABLE merchants, stores, products, store_products, members, staff, running_numbers, sync_metadata, roles, branches CASCADE`;
    console.log('✅ Truncation successful');
    process.exit(0);
  } catch (err) {
    console.error('❌ Truncation failed:', err);
    process.exit(1);
  }
}

truncate();
