import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    role: 'admin' | 'user';
    tier: 'basic' | 'premium';
    isActive: boolean;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    tier: { type: String, enum: ['basic', 'premium'], default: 'basic' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
