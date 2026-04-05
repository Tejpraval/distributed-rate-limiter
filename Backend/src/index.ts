import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db';
import { tokenBucketRateLimiter } from './middleware/rateLimiter';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Apply rate limiter
app.use(tokenBucketRateLimiter);

app.get('/api/test', (req, res) => {
    res.json({ message: 'Success! Request passed the rate limiter.' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
