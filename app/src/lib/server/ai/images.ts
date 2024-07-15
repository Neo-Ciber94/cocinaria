import { env } from '$env/dynamic/private';
import OpenAI from 'openai';
import { uploadFile } from '../blob';

type GenerateImageArgs = {
	prompt: string;
	userId: string;
};

const openAI = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function generateImage({ prompt, userId }: GenerateImageArgs) {
	console.log('Generating image: ', prompt);
	const response = await openAI.images.generate({
		model: 'dall-e-3',
		response_format: 'url',
		user: userId,
		prompt
	});

	const imageUrl = response.data[0]?.url;

	if (!imageUrl) {
		throw new Error('Not image was generated');
	}

	const imageResponse = await fetch(imageUrl);

	if (!imageResponse.ok) {
		throw new Error('Failed to fetch generated image');
	}

	const blob = await imageResponse.blob();

	// For some reason s3 fails to upload with line breaks:
	// TypeError [ERR_INVALID_CHAR]: Invalid character in header content ["x-amz-meta-prompt"]
	const promptMetadata = prompt.split('\n').join(' ');
	const uploadedImage = await uploadFile({
		data: blob,
		metadata: {
			userId,
			prompt: promptMetadata,
			aiGenerated: 'true',
			model: 'dall-e-3',
			date: new Date().toISOString()
		}
	});
	return uploadedImage;
}
