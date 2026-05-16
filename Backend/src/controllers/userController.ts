import { Request, Response } from 'express';
import { User } from '../models/User';
import { sendSuccess, sendError } from '../utils/response';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
        sendSuccess(res, { users }, 'Users fetched successfully');
    } catch (error) {
        console.error('Get users error:', error);
        sendError(res, 'Internal server error', 500);
    }
};

export const updateUserTier = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { tier } = req.body;

        const user = await User.findByIdAndUpdate(id, { tier }, { new: true }).select('-passwordHash');
        if (!user) {
            sendError(res, 'User not found', 404);
            return;
        }

        sendSuccess(res, { user }, 'User tier updated successfully');
    } catch (error) {
        console.error('Update user tier error:', error);
        sendError(res, 'Internal server error', 500);
    }
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(id, { isActive }, { new: true }).select('-passwordHash');
        if (!user) {
            sendError(res, 'User not found', 404);
            return;
        }

        sendSuccess(res, { user }, 'User status updated successfully');
    } catch (error) {
        console.error('Toggle user status error:', error);
        sendError(res, 'Internal server error', 500);
    }
};
