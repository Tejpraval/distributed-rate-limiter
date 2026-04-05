import mongoose, { Schema, Document } from 'mongoose';

export interface IRequestLog extends Document {
    apiKey: string;
    endpoint: string;
    ip: string;
    status: number;
}

const RequestLogSchema: Schema = new Schema({
    apiKey: { type: String, required: true },
    endpoint: { type: String, required: true },
    ip: { type: String, required: true },
    status: { type: Number, required: true }
}, { timestamps: true });

// Optional: Automatically expire logs after 7 days
RequestLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export const RequestLog = mongoose.model<IRequestLog>('RequestLog', RequestLogSchema);
