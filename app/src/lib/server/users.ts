import { FREE_CREDITS_COUNT } from '$lib/common/constants';
import { db } from '$lib/db';
import { accounts, users } from '$lib/db/schema';
import type { AuthProvider } from '$lib/db/types';
import { and, eq } from 'drizzle-orm';
import { invariant } from '..';

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

export async function consumeCreditFromUserAccount(userId: string, database: typeof db) {
	const creditsToConsume = 1;

	await database.transaction(async (tx) => {
		const userAccount = await tx.query.accounts.findFirst({
			where(fields, { eq }) {
				return eq(fields.userId, userId);
			}
		});

		if (!userAccount) {
			return;
		}

		// We only reduce the credits to non-premium users
		if (!userAccount.isPremium) {
			const currentCredits = userAccount.credits;
			invariant(
				currentCredits > 0,
				'It shouldnt be impossible for an account with 0 credits to reach this code path'
			);

			const newCredits = currentCredits <= 0 ? 0 : currentCredits - creditsToConsume;

			await tx
				.update(accounts)
				.set({ credits: newCredits })
				.where(
					and(eq(accounts.authAccountId, userAccount.authAccountId), eq(accounts.userId, userId))
				);
		}
	});
}
