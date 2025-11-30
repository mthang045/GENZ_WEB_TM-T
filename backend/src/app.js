import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import Redis from 'ioredis';
import mongoose from 'mongoose';
import productsRouter from './routes/products.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import ordersRouter from './routes/orders.js';
import cartsRouter from './routes/carts.js';
import debugRouter from './routes/debug.js';
import paymentsRouter from './routes/payments.js';
import chatbotRouter from './routes/chatbot.js';

dotenv.config();
const app = express();

// Logging middleware - add before CORS
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Enable CORS with dynamic origin for dev (allow localhost:3000, 3001, 5173, ...)
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        // Allow all localhost ports (dev/prod static serve)
        if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        // Allow from .env FRONTEND_URL if set
        if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
            return callback(null, true);
        }
        console.error('CORS blocked:', origin);
        callback(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-debug-key']
}));
app.use(express.json());
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);
// MongoDB client
let mongoClient;
export let db;
// Connect to MongoDB (mongodb driver) and mongoose
async function connectMongo() {
    try {
        mongoClient = new MongoClient(MONGO_URI);
        await mongoClient.connect();
        db = mongoClient.db('genz');
        console.log('Connected to MongoDB (native driver)');
        // Kết nối mongoose (KHÔNG truyền options useNewUrlParser/useUnifiedTopology)
        await mongoose.connect(MONGO_URI + '/genz');
        console.log('Connected to MongoDB (mongoose)');
    }
    catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}
connectMongo();
// Redis client - temporarily disabled to reduce log noise
export const redis = null; // new Redis({ host: REDIS_HOST, port: REDIS_PORT });
// redis.on('error', (err) => console.error('Redis error', err));

// Mount debug router TRƯỚC TẤT CẢ các router khác để không bị chặn bởi middleware khác
if (process.env.DEBUG_KEY) {
    app.use(process.env.API_PREFIX || '/api', debugRouter);
}
// Mount routes - chatbot FIRST (no auth required)
app.use('/api/chatbot', chatbotRouter);

// Other routes with various auth requirements
app.use(process.env.API_PREFIX || '/api', paymentsRouter);
app.use(process.env.API_PREFIX || '/api', productsRouter);
app.use(process.env.API_PREFIX || '/api', authRouter);
app.use(process.env.API_PREFIX || '/api', ordersRouter);
app.use(process.env.API_PREFIX || '/api', cartsRouter);

app.use('/', healthRouter);

// Catch-all error and response logger for debugging
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Catch-all 404 handler for debugging
app.use((req, res) => {
    res.status(404).json({ error: 'Not found', path: req.originalUrl });
});
export default app;
