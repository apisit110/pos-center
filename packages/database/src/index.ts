import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@pos-center/models';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from current package or root
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/lightning_pos';

// on Lambda every instance serves one request at a time and DATABASE_URL points at the Supabase
// transaction pooler, which hands the connection to another client after each transaction:
// keep a single connection per instance and skip prepared statements (the pooler can't keep them)
const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const client = postgres(connectionString, isLambda ? { max: 1, prepare: false, idle_timeout: 20 } : {});
export const db = drizzle(client, { schema });

export * from '@pos-center/models';
export * from 'drizzle-orm';
export * from './rateLimitStore';
