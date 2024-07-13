import type { authProviderEnum } from './schema';

export type AuthProvider = (typeof authProviderEnum.enumValues)[number];
