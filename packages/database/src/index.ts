import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@lightning/models';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from root if exists
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/lightning_pos';

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

export * from '@lightning/models';
