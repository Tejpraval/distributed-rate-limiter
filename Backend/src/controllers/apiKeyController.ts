import { Request, Response } from 'express';
import crypto from 'crypto';
import { ApiKey } from '../models/ApiKey';
import { sendSuccess, sendError } from '../utils/response';

const generateKey = (environment: 'live' | 'test') => {
    const prefix = environment === 'live' ? 'rl_live_' : 'rl_test_';
    const randomString = crypto.randomBytes(32).toString('base64url');
    return `${prefix}${randomString}`;
};

const hashKey = (key: string) => {
    return crypto.createHash('sha256').update(key).digest('hex');
};

const maskKey = (key: string) => {
    const parts = key.split('_');
    const prefix = `${parts[0]}_${parts[1]}_`;
    const secret = parts[2];
    return `${prefix}${secret.substring(0, 4)}...${secret.substring(secret.length - 4)}`;
};

export const createApiKey = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, environment } = req.body;
        const userId = (req as any).user.userId;

        const rawKey = generateKey(environment);
        const keyHash = hashKey(rawKey);
        const maskedKey = maskKey(rawKey);

        const apiKey = await ApiKey.create({
            keyHash,
            maskedKey,
            userId,
            name,
            environment
        });

        sendSuccess(res, {
            apiKey: {
                id: apiKey._id,
                name: apiKey.name,
                environment: apiKey.environment,
                maskedKey: apiKey.maskedKey,
                createdAt: apiKey.createdAt
            },
            rawKey // This is the ONLY time the full key is ever shown
        }, 'API key created successfully', 201);
    } catch (error) {
        console.error('Create API key error:', error);
        sendError(res, 'Internal server error', 500);
    }
};

export const getApiKeys = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.userId;
        const keys = await ApiKey.find({ userId, isRevoked: false })
                                 .select('-keyHash')
                                 .sort({ createdAt: -1 });

        sendSuccess(res, { keys }, 'API keys fetched successfully');
    } catch (error) {
        console.error('Get API keys error:', error);
        sendError(res, 'Internal server error', 500);
    }
};

export const revokeApiKey = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.userId;

        const apiKey = await ApiKey.findOneAndUpdate(
            { _id: id, userId, isRevoked: false },
            { isRevoked: true, revokedAt: new Date() },
            { new: true }
        ).select('-keyHash');

        if (!apiKey) {
            sendError(res, 'API key not found or already revoked', 404);
            return;
        }

        sendSuccess(res, { apiKey }, 'API key revoked successfully');
    } catch (error) {
        console.error('Revoke API key error:', error);
        sendError(res, 'Internal server error', 500);
    }
};
