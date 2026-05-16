import { z } from 'zod';

export const createApiKeySchema = z.object({
    body: z.object({
        name: z.string().min(1, 'API Key name is required'),
        environment: z.enum(['live', 'test'])
    })
});
