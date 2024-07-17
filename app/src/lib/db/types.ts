import type { accounts, authProviderEnum, recipes } from './schema';

export type AuthProvider = (typeof authProviderEnum.enumValues)[number];

export type Recipe = typeof recipes.$inferSelect;

export type Account = typeof accounts.$inferSelect;
