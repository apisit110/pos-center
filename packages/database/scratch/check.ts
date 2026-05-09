import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/lightning_pos';
const sql = postgres(connectionString);

async function check() {
  console.log('🔍 Checking columns in merchants table...');
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'merchants'
    `;
    console.log(columns);
    process.exit(0);
  } catch (err) {
    console.error('❌ Check failed:', err);
    process.exit(1);
  }
}

check();
