import 'dotenv/config';
import { db, client } from '$lib/db';
import { ListObjectsV2Command, S3Client, type _Object } from '@aws-sdk/client-s3';

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

console.log('S3 Objects:');
console.log(images.Contents);

const orphanImages: _Object[] = [];
const contents = images.Contents || [];

for (const imageObject of contents) {
	if (!imageObject.Key) {
		continue;
	}

	const url = `${process.env.ASSETS_URL}/${imageObject.Key}`;

	const exists = recipes.some((x) => x.imageUrl === url);

	if (!exists) {
		console.log(`Orphan image: ${url}`);
		orphanImages.push(imageObject);
	}
}

await client.end();
