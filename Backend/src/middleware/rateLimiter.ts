import type { Request, Response, NextFunction } from 'express';
import * as promClient from 'prom-client';
import redisClient from '../redisClient';
import { User } from '../models/User';
import { RequestLog } from '../models/RequestLog';

export const rateLimitCounter = new promClient.Counter({
    name: 'rate_limit_requests_total',
    help: 'Total number of rate limit evaluations',
    labelNames: ['tier', 'status']
});

const LIMITS = {
    basic: 100, // 100 requests per minute
    premium: 500 // 500 requests per minute
};
const WINDOW_TIME_MS = 60 * 1000;

// The Lua script executes atomically inside Redis
const tokenBucketScript = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local currentTime = tonumber(ARGV[3])

local tokens = capacity
local lastRefillTime = currentTime

local record = redis.call('HMGET', key, 'tokens', 'last_refill_time')
if record[1] and record[2] then
    tokens = tonumber(record[1])
    lastRefillTime = tonumber(record[2])
    
    local timeElapsed = currentTime - lastRefillTime
    local newTokensToAdd = timeElapsed * refillRate
    tokens = math.min(capacity, tokens + newTokensToAdd)
end

if tokens >= 1 then
    tokens = tokens - 1
    redis.call('HMSET', key, 'tokens', tokens, 'last_refill_time', currentTime)
    redis.call('EXPIRE', key, 120)
    return {1, tokens} 
else
    return {0, tokens}
end
`;

export const tokenBucketRateLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
        res.status(401).json({ error: 'Unauthorized', message: 'API Key is missing in headers (x-api-key)' });
        return;
    }

    const key = `rate_limit:user:${apiKey}`;
    const userCacheKey = `user_tier:${apiKey}`;

    try {
        let tier: 'basic' | 'premium' = 'basic';
        let capacity = LIMITS.basic;

        const cachedTier = await redisClient.get(userCacheKey);
        
        if (cachedTier) {
            tier = cachedTier as 'basic' | 'premium';
            capacity = LIMITS[tier];
        } else {
            const user = await User.findOne({ apiKey });
            if (!user) {
                res.status(401).json({ error: 'Unauthorized', message: 'Invalid API Key' });
                return;
            }
            tier = user.tier;
            capacity = LIMITS[tier];
            await redisClient.setex(userCacheKey, 600, tier);
        }

        const refillRatePerMs = capacity / WINDOW_TIME_MS;
        const currentTime = Date.now();
        
        // Execute Lua Script Atomically!
        const result = await redisClient.eval(
            tokenBucketScript,
            1, // number of keys
            key, // KEYS[1]
            capacity, // ARGV[1]
            refillRatePerMs, // ARGV[2]
            currentTime // ARGV[3]
        ) as [number, number];

        const isAllowed = result[0] === 1;
        const remainingTokens = result[1];
        const statusCode = isAllowed ? 200 : 429;

        // Increment Prometheus metric
        rateLimitCounter.inc({ tier, status: isAllowed ? 'allowed' : 'rejected' });

        // Asynchronous DB log
        RequestLog.create({
            apiKey,
            endpoint: req.originalUrl,
            ip: req.ip || 'unknown',
            status: statusCode
        }).catch(err => console.error('Failed to log request:', err));

        if (isAllowed) {
            res.setHeader('X-RateLimit-Limit', capacity);
            res.setHeader('X-RateLimit-Remaining', Math.floor(remainingTokens));
            next();
        } else {
            res.setHeader('X-RateLimit-Limit', capacity);
            res.setHeader('X-RateLimit-Remaining', 0);
            res.status(429).json({
                error: 'Too Many Requests',
                message: 'Rate limit exceeded for your tier.'
            });
        }
    } catch (err) {
        console.error('Rate Limiter Error (Fail-Open):', err);
        next();
    }
};
