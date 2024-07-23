import 'dotenv/config';
import {
	CopyObjectCommand,
	DeleteObjectCommand,
	ListObjectsV2Command,
	S3Client
} from '@aws-sdk/client-s3';

// I wrongly placed the objects in the incorrect, path, so each image have a duplicated bucket name: <bucket-name>/<bucket-name>/images

throw new Error('This migration was already applied');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function main() {
	const s3Client = new S3Client({
		endpoint: process.env.S3_API_ENDPOINT,
		credentials: {
			accessKeyId: process.env.S3_ACCESS_KEY!,
			secretAccessKey: process.env.S3_ACCESS_SECRET_KEY!
		}
	});

	const bucketName = process.env.S3_BUCKET_NAME!;
	const listCommand = new ListObjectsV2Command({
		Bucket: bucketName,
		Prefix: `${bucketName}/` // This targets the duplicated path
	});

	const listResponse = await s3Client.send(listCommand);

	for (const object of listResponse.Contents || []) {
		if (!object.Key || !object.Key.startsWith(bucketName)) {
			console.log(`Skipping ${object.Key}`);
			continue;
		}

		const newKey = object.Key.replace(`${bucketName}/`, '');

		// Copy to new location
		await s3Client.send(
			new CopyObjectCommand({
				Bucket: bucketName,
				CopySource: `${bucketName}/${object.Key}`,
				Key: newKey
			})
		);

		console.log(`Copied ${object.Key} to ${newKey}`);

		// Delete from old location
		await s3Client.send(
			new DeleteObjectCommand({
				Bucket: bucketName,
				Key: object.Key
			})
		);

		console.log(`Deleted ${object.Key}`);
	}
}
