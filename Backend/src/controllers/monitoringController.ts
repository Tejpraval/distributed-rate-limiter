import { Request, Response } from 'express';
import mongoose from 'mongoose';
import redisClient from '../redisClient';
import { sendSuccess, sendError } from '../utils/response';

export const getSystemHealth = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check MongoDB
        const mongoState = mongoose.connection.readyState;
        const mongoStatus = mongoState === 1 ? 'connected' : 'disconnected';

        // Check Redis
        let redisStatus = 'disconnected';
        try {
            const ping = await redisClient.ping();
            if (ping === 'PONG') {
                redisStatus = 'connected';
            }
        } catch (e) {
            redisStatus = 'disconnected';
        }

        const isHealthy = mongoStatus === 'connected' && redisStatus === 'connected';

        sendSuccess(res, {
            status: isHealthy ? 'healthy' : 'unhealthy',
            services: {
                mongodb: mongoStatus,
                redis: redisStatus
            },
            timestamp: new Date().toISOString()
        }, 'System health fetched');
    } catch (error) {
        console.error('System health error:', error);
        sendError(res, 'Failed to fetch system health', 500);
    }
};
