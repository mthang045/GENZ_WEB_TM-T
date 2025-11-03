import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import Redis from 'ioredis';
import productsRouter from './routes/products';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import ordersRouter from './routes/orders';
import cartsRouter from './routes/carts';
import debugRouter from './routes/debug';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);

// MongoDB client
let mongoClient: MongoClient;
export let db: any;

// Connect to MongoDB
async function connectMongo() {
  try {
    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    db = mongoClient.db('genz');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

connectMongo();

// Redis client
export const redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
redis.on('error', (err) => console.error('Redis error', err));

// Mount routes
app.use(process.env.API_PREFIX || '/api', productsRouter);
app.use(process.env.API_PREFIX || '/api', authRouter);
app.use(process.env.API_PREFIX || '/api', ordersRouter);
app.use(process.env.API_PREFIX || '/api', cartsRouter);
if (process.env.DEBUG_KEY) {
  app.use(process.env.API_PREFIX || '/api', debugRouter);
}
app.use('/', healthRouter);

export default app;
