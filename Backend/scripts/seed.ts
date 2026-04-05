import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/User';

dotenv.config();

const seed = async () => {
    try {
        console.log('Connecting to Mongo...', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI!);
        
        await User.deleteMany({});
        
        await User.create({
            apiKey: 'test-basic-key',
            tier: 'basic'
        });

        await User.create({
            apiKey: 'test-premium-key',
            tier: 'premium'
        });

        console.log('Seeded database with 2 test users (test-basic-key, test-premium-key)');
    } catch (err) {
        console.error('Seed error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

seed();
