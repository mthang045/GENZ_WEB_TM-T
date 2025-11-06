import { Router } from 'express';
import { redis } from '../app';
import { db } from '../app';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/products - return list, cached in Redis
router.get('/products', async (req, res) => {
  try {
    const cacheKey = 'products:all';
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json({ source: 'cache', data: JSON.parse(cached) });
      }
    } catch (redisErr) {
      const e: any = redisErr as any
      console.warn('Redis unavailable, falling back to DB:', e.message || e);
    }

    const productsCollection = db.collection('products');
    const products = await productsCollection.find({}).toArray();
    
    // Ensure inStock field is present and defaults to true if not specified
    const productsWithStock = products.map((product: any) => ({
      ...product,
      inStock: product.inStock !== undefined ? product.inStock : (product.stock !== undefined ? product.stock > 0 : true)
    }));
    
    try {
      await redis.set(cacheKey, JSON.stringify(productsWithStock), 'EX', 60);
    } catch (redisErr) {
      const e: any = redisErr as any
      console.warn('Failed to set redis cache:', e.message || e);
    }
    
    return res.json({ source: 'db', data: productsWithStock });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/products - create product and invalidate cache
router.post('/products', requireAdmin, async (req, res) => {
  try {
    const payload = req.body;
    const productsCollection = db.collection('products');
    const result = await productsCollection.insertOne(payload);
    
    try {
      await redis.del('products:all');
    } catch (redisErr) {
      const e: any = redisErr as any
      console.warn('Failed to clear redis cache:', e.message || e);
    }
    
    return res.status(201).json({ id: result.insertedId, ...payload });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

export default router;
