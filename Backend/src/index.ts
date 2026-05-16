import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as promClient from 'prom-client';
import { connectDB } from './db';
import { tokenBucketRateLimiter } from './middleware/rateLimiter';

// Routes
import authRoutes from './routes/authRoutes';
import apiKeyRoutes from './routes/apiKeyRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import userRoutes from './routes/userRoutes';
import monitoringRoutes from './routes/monitoringRoutes';

dotenv.config();

// Collect default Node.js health metrics
promClient.collectDefaultMetrics();

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: true, // Allows request from any origin (e.g. S3 frontend) and matches it
    credentials: true // Crucial for HttpOnly cookies
}));
app.use(express.json());
app.use(cookieParser());

// Expose Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
});

// Admin & Dashboard APIs (Not rate-limited by the token bucket, protected by JWT)
app.use('/api/auth', authRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/monitoring', monitoringRoutes);

// External APIs (Rate-limited using API Keys)
app.use('/api/external', tokenBucketRateLimiter);

app.get('/api/external/test', (req, res) => {
    res.json({ message: 'Success! Request passed the rate limiter.' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
