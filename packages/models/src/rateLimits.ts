import { pgTable, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

// hit counters of express-rate-limit, shared by every service instance (Lambda keeps no memory between instances)
export const rateLimits = pgTable('rate_limits', {
  key: varchar('key', { length: 255 }).primaryKey(), // e.g., 'portal-login:1.2.3.4'
  hits: integer('hits').notNull().default(0),
  resetAt: timestamp('reset_at', { withTimezone: true }).notNull(),
});
