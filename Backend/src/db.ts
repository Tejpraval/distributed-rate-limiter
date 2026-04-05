import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (): Promise<void> => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGO_URI missing in .env');
        }

        await mongoose.connect(uri);
        console.log('Successfully connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        // We do not want to exit immediately in a real fail-open setup if Mongo is purely for config
        // but typically you fail startup if DB is totally down.
    }
};
