import { z } from 'zod';

export const updateUserTierSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'User ID is required')
    }),
    body: z.object({
        tier: z.enum(['basic', 'premium'])
    })
});

export const toggleUserStatusSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'User ID is required')
    }),
    body: z.object({
        isActive: z.boolean()
    })
});
