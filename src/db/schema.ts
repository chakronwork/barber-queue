import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const queues = pgTable('queues', {
  id: serial('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  service: text('service').notNull(),
  status: text('status').notNull().default('pending'),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
