import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const authProviderEnum = pgEnum('auth_provider', ['github', 'google', 'discord']);

export const users = pgTable('user', {
	id: uuid('id').primaryKey(),
	username: text('username').notNull(),
	email: varchar('email', { length: 256 }).notNull(),
	picture: varchar('picture'),
	accountId: uuid('account_id').notNull()
});

export const accounts = pgTable('account', {
	id: uuid('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id),
	authAccountId: varchar('auth_account_id').notNull(),
	authProvider: authProviderEnum('auth_provider')
});

export const sessions = pgTable('session', {
	id: text('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date'
	}).notNull()
});

export const userAccountRelation = relations(users, ({ one }) => ({
	account: one(accounts, {
		fields: [users.accountId],
		references: [accounts.id]
	})
}));
