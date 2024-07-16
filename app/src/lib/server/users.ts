import { FREE_CREDITS_COUNT } from '$lib/common/constants';
import { db } from '$lib/db';
import { accounts, users } from '$lib/db/schema';
import type { AuthProvider } from '$lib/db/types';

type CreateUserAccountArgs = {
	userId: string;
	accountId: string;
	username: string;
	picture?: string;
	authAccountId: string;
	authProvider: AuthProvider;
};

export async function createUserAccount(args: CreateUserAccountArgs) {
	const { userId, accountId, username, picture, authAccountId, authProvider } = args;

	return await db.transaction(async (tx) => {
		await tx.insert(users).values({
			id: userId,
			accountId,
			username,
			picture
		});

		await tx.insert(accounts).values({
			userId,
			authAccountId,
			authProvider,
			credits: FREE_CREDITS_COUNT
		});
	});
}

export async function isUserAllowedToUseAI(userId: string) {
	const account = await db.query.accounts.findFirst({
		where(fields, { and, eq }) {
			return and(eq(fields.userId, userId));
		}
	});

	if (!account) {
		return false;
	}

	return account.isPremium || account.credits > 0;
}
