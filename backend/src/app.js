import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import Redis from 'ioredis';
import productsRouter from './routes/products.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import ordersRouter from './routes/orders.js';
import cartsRouter from './routes/carts.js';
import debugRouter from './routes/debug.js';
import paymentsRouter from './routes/payments.js';
import chatbotRouter from './routes/chatbot.js'; // Đây là file chứa Groq AI mới
// import aiRouter from './routes/ai.js'; // ❌ Tạm tắt file này vì có thể chứa code Gemini cũ gây lỗi

dotenv.config();
const app = express();

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ✅ CẤU HÌNH LẠI CORS (Thêm port 5173 của Vite)
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://localhost:3001', 
        'http://localhost:5173', // Quan trọng: Port mặc định của Vite React
        'http://127.0.0.1:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';

// MongoDB client
let mongoClient;
export let db;

// Connect to MongoDB
async function connectMongo() {
    try {
        mongoClient = new MongoClient(MONGO_URI);
        await mongoClient.connect();
        db = mongoClient.db('genz');
        console.log('✅ Connected to MongoDB');
    }
    catch (err) {
        console.error('❌ MongoDB connection error:', err);
        // Không exit process để server vẫn chạy được các chức năng khác nếu DB lỗi
    }
}
connectMongo();

// Redis client - temporarily disabled
export const redis = null; 

// --- MOUNT ROUTES ---

// 1. Chatbot Groq AI (Không cần Auth)
app.use('/api/chatbot', chatbotRouter);

// 2. Tắt route AI cũ để tránh xung đột
// app.use('/api/ai', aiRouter); 

// 3. Các routes khác
app.use(process.env.API_PREFIX || '/api', paymentsRouter);
app.use(process.env.API_PREFIX || '/api', productsRouter);
app.use(process.env.API_PREFIX || '/api', authRouter);
app.use(process.env.API_PREFIX || '/api', ordersRouter);
app.use(process.env.API_PREFIX || '/api', cartsRouter);

if (process.env.DEBUG_KEY) {
    app.use(process.env.API_PREFIX || '/api', debugRouter);
}
app.use('/', healthRouter);

export default app;