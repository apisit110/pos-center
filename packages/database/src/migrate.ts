import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/lightning_pos';

const runMigration = async () => {
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log('⏳ Running migrations...');

  const start = Date.now();

  await migrate(db, {
    migrationsFolder: path.join(__dirname, '../../models/drizzle'),
  });

  const end = Date.now();

  console.log(`✅ Migrations completed in ${end - start}ms`);

  process.exit(0);
};

runMigration().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
