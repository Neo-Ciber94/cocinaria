import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, client } from './src/lib/db';

migrate(db, { migrationsFolder: './drizzle' })
	.catch((err) => {
		console.error(err);
	})
	.finally(() => {
		client.end();
	});
