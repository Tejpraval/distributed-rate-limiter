import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { tokenBucketRateLimiter } from './rateLimiter';
import redisClient from '../redisClient';
import { ApiKey } from '../models/ApiKey';
import type { Request, Response, NextFunction } from 'express';

// Mock Redis Client
jest.mock('../redisClient', () => ({
    get: jest.fn(),
    setex: jest.fn(),
    eval: jest.fn()
}));

// Mock Mongoose Models
jest.mock('../models/ApiKey', () => ({
    ApiKey: {
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn().mockReturnThis(),
        exec: (jest.fn() as any).mockResolvedValue({})
    }
}));

jest.mock('../models/RequestLog', () => ({
    RequestLog: {
        create: (jest.fn() as any).mockResolvedValue({})
    }
}));

describe('tokenBucketRateLimiter Middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            headers: {},
            originalUrl: '/api/test',
            ip: '127.0.0.1'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            setHeader: jest.fn()
        } as any;
        next = jest.fn();
    });

    it('should return 401 if API Key is missing', async () => {
        await tokenBucketRateLimiter(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'Unauthorized',
            message: 'API Key is missing in headers (x-api-key)'
        }));
        expect(next).not.toHaveBeenCalled();
    });

    it('should allow request if tokens are available', async () => {
        req.headers!['x-api-key'] = 'valid-key';
        
        // Mock cached tier
        (redisClient.get as any).mockResolvedValue('basic');
        // Mock Redis eval returning [isAllowed, remainingTokens]
        (redisClient.eval as any).mockResolvedValue([1, 99]);

        await tokenBucketRateLimiter(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 99);
    });

    it('should block request if rate limit is exceeded', async () => {
        req.headers!['x-api-key'] = 'valid-key';
        
        // Mock cached tier
        (redisClient.get as any).mockResolvedValue('basic');
        // Mock Redis eval returning [isAllowed, remainingTokens]
        (redisClient.eval as any).mockResolvedValue([0, 0]);

        await tokenBucketRateLimiter(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'Too Many Requests'
        }));
        expect(next).not.toHaveBeenCalled();
    });
});
