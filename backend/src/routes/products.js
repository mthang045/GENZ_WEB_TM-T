import { Router } from 'express';
import { redis, db } from '../app.js';
import { requireAdmin } from '../middleware/auth.js';
const router = Router();
// GET /api/products - return list, cached in Redis
router.get('/products', async (req, res) => {
    try {
        const cacheKey = 'products:all';
        try {
            if (redis) {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    return res.json({ source: 'cache', data: JSON.parse(cached) });
                }
            }
        }
        catch (redisErr) {
            const e = redisErr;
            console.warn('Redis unavailable, falling back to DB:', e.message || e);
        }
        const productsCollection = db.collection('products');
        const products = await productsCollection.find({}).toArray();
        // Calculate inStock based on stock array (new structure)
        const productsWithStock = products.map((product) => {
            let inStock = true;
            // If stock is array (new structure), check if any variant has quantity > 0
            if (Array.isArray(product.stock) && product.stock.length > 0) {
                inStock = product.stock.some((s) => s.quantity > 0);
            }
            // Legacy support: if stock is number
            else if (typeof product.stock === 'number') {
                inStock = product.stock > 0;
            }
            // If no stock info, default to true
            else {
                inStock = true;
            }
            return Object.assign(Object.assign({}, product), { inStock: product.inStock !== undefined && product.inStock !== null ? product.inStock : inStock });
        });
        try {
            if (redis) {
                await redis.set(cacheKey, JSON.stringify(productsWithStock), 'EX', 60);
            }
        }
        catch (redisErr) {
            const e = redisErr;
            console.warn('Failed to set redis cache:', e.message || e);
        }
        return res.json({ source: 'db', data: productsWithStock });
    }
    catch (err) {
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
            if (redis) {
                await redis.del('products:all');
            }
        }
        catch (redisErr) {
            const e = redisErr;
            console.warn('Failed to clear redis cache:', e.message || e);
        }
        return res.status(201).json(Object.assign({ id: result.insertedId }, payload));
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create product' });
    }
});
export default router;
