import mongoose, { Schema, Document } from 'mongoose';

export interface IApiKey extends Document {
    keyHash: string;
    maskedKey: string;
    userId: mongoose.Types.ObjectId;
    name: string; // e.g., "Production Key", "Test Key"
    environment: 'live' | 'test'; // To match rl_live_ or rl_test_
    isActive: boolean;
    isRevoked: boolean;
    lastUsedAt?: Date;
    totalRequests: number;
    revokedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ApiKeySchema: Schema = new Schema({
    keyHash: { type: String, required: true, unique: true },
    maskedKey: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, default: 'Default Key' },
    environment: { type: String, enum: ['live', 'test'], required: true },
    isActive: { type: Boolean, default: true },
    isRevoked: { type: Boolean, default: false },
    lastUsedAt: { type: Date },
    totalRequests: { type: Number, default: 0 },
    revokedAt: { type: Date }
}, { timestamps: true });

export const ApiKey = mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
