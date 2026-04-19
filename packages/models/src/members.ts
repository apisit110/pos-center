import { pgTable, varchar, timestamp, serial, integer } from 'drizzle-orm/pg-core';

export const members = pgTable('members', {
  id: serial('id').primaryKey(),
  uid: varchar('uid', { length: 255 }).unique().notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  tier: varchar('tier', { length: 20 }).notNull().default('Bronze'),
  points: integer('points').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
