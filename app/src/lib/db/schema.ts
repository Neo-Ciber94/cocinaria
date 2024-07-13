import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, primaryKey, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const authProviderEnum = pgEnum('auth_provider', ['github', 'google', 'discord']);

export const users = pgTable('user', {
	id: uuid('id').primaryKey(),
	username: text('username').notNull(),
	picture: varchar('picture'),
	accountId: uuid('account_id').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

export const accounts = pgTable(
	'account',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		authAccountId: varchar('auth_account_id').notNull(),
		authProvider: authProviderEnum('auth_provider').notNull()
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.authAccountId, table.authProvider] })
		};
	}
);

export const sessions = pgTable('session', {
	id: text('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const userAccountRelation = relations(users, ({ one }) => ({
	account: one(accounts, {
		fields: [users.id],
		references: [accounts.userId]
	})
}));
