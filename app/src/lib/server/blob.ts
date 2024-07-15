import { env } from '$env/dynamic/private';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

type UploadedFile = {
	key: string;
	url: string;
};

type UploadFileArgs = {
	data: Blob;
	metadata?: Record<string, string>;
};

const s3Client = new S3Client({
	endpoint: env.S3_API_ENDPOINT,
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY,
		secretAccessKey: env.S3_ACCESS_SECRET_KEY
	}
});

export async function uploadFile({ data, metadata }: UploadFileArgs): Promise<UploadedFile> {
	const fileId = generateFileId();
	const fileType = data.type.split('/')[1];
	const ext = fileType ? `.${fileType}` : '';
	const key = `images/${fileId}${ext}`;

	const buffer = Buffer.from(await data.arrayBuffer());
	const result = await s3Client.send(
		new PutObjectCommand({
			Bucket: env.S3_BUCKET_NAME,
			Key: key,
			Body: buffer,
			ContentType: data.type,
			Metadata: metadata
		})
	);

	const url = `${env.ASSETS_URL}/${key}`;
	console.log(`File uploaded: ${url}`, result);

	return {
		key,
		url
	};
}

export async function deleteFile(url: string) {
	try {
		let key = url.replaceAll(env.ASSETS_URL, '');
		if (key.startsWith('/')) {
			key = key.slice(1);
		}

		console.log('Deleting file: ', key);

		await s3Client.send(
			new DeleteObjectCommand({
				Bucket: env.S3_BUCKET_NAME,
				Key: key
			})
		);

		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}

function generateFileId() {
	return btoa(crypto.randomUUID()).replaceAll('=', '');
}
