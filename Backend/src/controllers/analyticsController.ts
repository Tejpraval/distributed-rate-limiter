import { Request, Response } from 'express';
import { RequestLog } from '../models/RequestLog';
import { ApiKey } from '../models/ApiKey';
import { User } from '../models/User';
import { sendSuccess, sendError } from '../utils/response';

export const getTraffic = async (req: Request, res: Response): Promise<void> => {
    try {
        const trafficData = await RequestLog.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    allowed: {
                        $sum: { $cond: [{ $eq: ["$status", 200] }, 1, 0] }
                    },
                    blocked: {
                        $sum: { $cond: [{ $eq: ["$status", 429] }, 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    timestamp: "$_id",
                    allowed: 1,
                    blocked: 1
                }
            }
        ]);

        sendSuccess(res, { traffic: trafficData }, 'Traffic data fetched successfully');
    } catch (error) {
        console.error('Get traffic error:', error);
        sendError(res, 'Internal server error', 500);
    }
};

export const getSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const [
            totalAllowed,
            totalBlocked,
            activeApiKeys,
            activeUsers
        ] = await Promise.all([
            RequestLog.countDocuments({ status: 200 }),
            RequestLog.countDocuments({ status: 429 }),
            ApiKey.countDocuments({ isRevoked: false }),
            User.countDocuments({ isActive: true })
        ]);

        const totalRequests = totalAllowed + totalBlocked;

        sendSuccess(res, {
            summary: {
                totalRequests,
                allowedRequests: totalAllowed,
                blockedRequests: totalBlocked,
                activeApiKeys,
                activeUsers
            }
        }, 'Summary fetched successfully');
    } catch (error) {
        console.error('Get summary error:', error);
        sendError(res, 'Internal server error', 500);
    }
};

export const getTopConsumers = async (req: Request, res: Response): Promise<void> => {
    try {
        const topConsumers = await ApiKey.find({ totalRequests: { $gt: 0 } })
            .sort({ totalRequests: -1 })
            .limit(10)
            .select('name environment maskedKey totalRequests lastUsedAt')
            .populate('userId', 'email tier');

        sendSuccess(res, { topConsumers }, 'Top consumers fetched successfully');
    } catch (error) {
        console.error('Get top consumers error:', error);
        sendError(res, 'Internal server error', 500);
    }
};
