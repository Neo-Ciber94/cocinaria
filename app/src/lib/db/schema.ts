import { RECIPE_TYPES } from '$lib/common/recipe';
import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
	varchar
} from 'drizzle-orm/pg-core';

export const authProviderEnum = pgEnum('auth_provider', ['github', 'google', 'discord']);

export const recipeTypeEnum = pgEnum('recipe_type', RECIPE_TYPES);

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
		isPremium: boolean('is_premium').default(false).notNull(),
		credits: integer('credits').default(0).notNull(),
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

type RecipeType = {
	ingredients: string[];
	steps: string[];
};

export const recipes = pgTable(
	'recipes',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		name: text('name').notNull(),
		description: text('description'),
		prompt: text('prompt').notNull(), // Prompt used for generate this recipe
		ingredients: jsonb('ingredients').$type<string[]>().notNull(),
		recipe: jsonb('recipe').$type<RecipeType>().notNull(),
		recipeType: recipeTypeEnum('recipe_type').notNull(),
		imageUrl: text('image_url'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
	},
	(table) => {
		return {
			name_idx: index('name_idx').on(table.name),
			ingredients_idx: index('ingredients_idx').using('gin', table.ingredients),
			recipe_type_idx: index('recipe_type_idx').on(table.recipeType)
		};
	}
);

export const userRelations = relations(users, ({ one }) => ({
	account: one(accounts, {
		fields: [users.id],
		references: [accounts.userId]
	})
}));
