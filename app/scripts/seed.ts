import 'dotenv/config';
import { db, client } from '$lib/db';
import { users } from '$lib/db/schema';

async function seed() {
	const anyUsers = await db.query.users.findFirst().then((x) => x != null);

	if (anyUsers) {
		console.log('⚠️  Database have data');
		await client.end();
		return;
	}

	console.log('🚧 Seeding database...');

	await db.insert(users).values({
		id: crypto.randomUUID(),
		username: 'test',
		email: 'someuser@example.com'
	});

	console.log('✅ Database seeded successfully!');
	await client.end();
}

await seed();
