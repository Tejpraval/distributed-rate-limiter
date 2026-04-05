import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Create Redis client using environment variables or defaults
const redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redisClient.on('connect', () => {
    console.log('Successfully connected to Redis');
});

export default redisClient;
