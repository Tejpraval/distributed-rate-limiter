import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { sendSuccess, sendError } from '../utils/response';

const generateToken = (userId: string, role: string, tier: string) => {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    return jwt.sign({ userId, role, tier }, secret, { expiresIn: '1d' });
};

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, role } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            sendError(res, 'Email already exists', 400);
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            email,
            passwordHash,
            role: role || 'user',
            tier: 'basic'
        });

        const token = generateToken(newUser._id.toString(), newUser.role, newUser.tier);
        res.cookie('token', token, cookieOptions);

        sendSuccess(res, {
            token,
            user: { id: newUser._id, email: newUser.email, role: newUser.role, tier: newUser.tier }
        }, 'Registration successful', 201);
    } catch (error) {
        console.error('Register error:', error);
        sendError(res, 'Internal server error', 500);
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !user.isActive) {
            sendError(res, 'Invalid credentials or account disabled', 401);
            return;
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            sendError(res, 'Invalid credentials or account disabled', 401);
            return;
        }

        const token = generateToken(user._id.toString(), user.role, user.tier);
        res.cookie('token', token, cookieOptions);

        sendSuccess(res, {
            token,
            user: { id: user._id, email: user.email, role: user.role, tier: user.tier }
        }, 'Login successful');
    } catch (error) {
        console.error('Login error:', error);
        sendError(res, 'Internal server error', 500);
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    res.cookie('token', '', { ...cookieOptions, maxAge: 0 });
    sendSuccess(res, null, 'Logged out successfully');
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.userId;
        const user = await User.findById(userId).select('-passwordHash');
        
        if (!user) {
            sendError(res, 'User not found', 404);
            return;
        }

        sendSuccess(res, { user }, 'User fetched successfully');
    } catch (error) {
        console.error('Get me error:', error);
        sendError(res, 'Internal server error', 500);
    }
};
