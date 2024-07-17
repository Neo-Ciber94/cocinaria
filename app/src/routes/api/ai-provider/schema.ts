import { aiProviderSchema } from '$lib/common/types';
import { z } from 'zod';

export const aiProviderKeySchema = z.object({
	apiKey: z.string(),
	aiProvider: aiProviderSchema
});

export type AIProviderKey = z.infer<typeof aiProviderKeySchema>;
