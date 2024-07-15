import type { authProviderEnum, recipes } from './schema';

export type AuthProvider = (typeof authProviderEnum.enumValues)[number];

export type Recipe = typeof recipes.$inferSelect;
