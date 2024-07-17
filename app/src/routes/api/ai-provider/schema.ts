import { aiProviderSchema } from '$lib/common/types';
import { z } from 'zod';

export const aiProviderConfig = z.object({
	apiKey: z.string(),
	aiProvider: aiProviderSchema
});

export type AIProviderConfig = z.infer<typeof aiProviderConfig>;
