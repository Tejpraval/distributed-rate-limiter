import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    apiKey: string;
    tier: 'basic' | 'premium';
}

const UserSchema: Schema = new Schema({
    apiKey: { type: String, required: true, unique: true },
    tier: { type: String, enum: ['basic', 'premium'], default: 'basic' }
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
