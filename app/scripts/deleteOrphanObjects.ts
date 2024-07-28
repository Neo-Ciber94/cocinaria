import dotenv from 'dotenv';
dotenv.config({
	path: ['.env', '.env.production'],
	override: true
});

import { db, client } from '$lib/db';
import {
	DeleteObjectCommand,
	ListObjectsV2Command,
	S3Client,
	type _Object
} from '@aws-sdk/client-s3';

// I forgot to delete the images when deleting recipes, this script solve it

const recipes = await db.query.recipes.findMany();

const s3Client = new S3Client({
	endpoint: process.env.S3_API_ENDPOINT,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY!,
		secretAccessKey: process.env.S3_ACCESS_SECRET_KEY!
	}
});

console.log('Getting objects...');
const images = await s3Client.send(
	new ListObjectsV2Command({
		Bucket: process.env.S3_BUCKET_NAME
	})
);

const orphanObjects: _Object[] = [];
const contents = images.Contents || [];

for (const imageObject of contents) {
	if (!imageObject.Key) {
		continue;
	}

	const url = `${process.env.ASSETS_URL}/${imageObject.Key}`;
	const exists = recipes.some((x) => x.imageUrl === url);

	if (!exists) {
		console.log(`Orphan object: ${url}`);
		orphanObjects.push(imageObject);
	}
}

if (orphanObjects.length > 0) {
	console.log('Deleting orphan objects...');
	const keys = orphanObjects.map((x) => x.Key);

	for (const key of keys) {
		console.log('Deleting object with key: ' + key);
		await s3Client.send(
			new DeleteObjectCommand({
				Bucket: process.env.S3_BUCKET_NAME,
				Key: key
			})
		);
	}

	console.log(`${keys.length} orphan objects deleted`);
} else {
	console.log('No orphan objects to delete');
}

await client.end();
