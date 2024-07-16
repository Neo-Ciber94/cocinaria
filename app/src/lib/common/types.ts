import type { Account } from '$lib/db/types';
import type { Session, User } from 'lucia';
import { z } from 'zod';

export type Auth = {
	session: Session;
	user: User;
	account: Account;
};

export const aiProviderSchema = z.enum(['openai', 'gemini', 'claude']);

export type AIProvider = z.infer<typeof aiProviderSchema>;
