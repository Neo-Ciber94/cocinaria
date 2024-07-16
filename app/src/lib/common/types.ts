import type { Account } from '$lib/db/types';
import type { Session, User } from 'lucia';

export type Auth = {
	session: Session;
	user: User;
	account: Account;
};
