import { env } from '$env/dynamic/private';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

type UploadedFile = {
	fileId: string;
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
	const key = `/images/${fileId}${ext}`;

	const result = await s3Client.send(
		new PutObjectCommand({
			Bucket: env.S3_BUCKET_NAME,
			Key: key,
			Body: data,
			ContentType: data.type,
			Metadata: metadata
		})
	);

	console.log(`File uploaded: ${key}`, result);

	return {
		fileId,
		url: `${env.ASSETS_URL}${key}`
	};
}

function generateFileId() {
	return btoa(crypto.randomUUID()).replaceAll('=', '');
}
