import express from 'express';
import dotenv from 'dotenv';
import * as promClient from 'prom-client';
import { connectDB } from './db';
import { tokenBucketRateLimiter } from './middleware/rateLimiter';

dotenv.config();

// Collect default Node.js health metrics
promClient.collectDefaultMetrics();

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Expose Prometheus metrics endpoint BEFORE the rate limiter
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
});

// Apply rate limiter
app.use(tokenBucketRateLimiter);

app.get('/api/test', (req, res) => {
    res.json({ message: 'Success! Request passed the rate limiter.' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    
});
