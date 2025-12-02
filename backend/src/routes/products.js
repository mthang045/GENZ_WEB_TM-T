import { Router } from 'express';
import { redis, db } from '../app.js';
import { requireAdmin } from '../middleware/auth.js';
const router = Router();

// Lấy sản phẩm mới
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
        const productsWithStock = products.map((product) => {
            let inStock = true;
            if (Array.isArray(product.stock) && product.stock.length > 0) {
                inStock = product.stock.some((s) => s.quantity > 0);
            }
            else if (typeof product.stock === 'number') {
                inStock = product.stock > 0;
            }
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

// Tạo sản phẩm mới (Admin only)
router.post('/products', requireAdmin, async (req, res) => {
    try {
        const payload = req.body || {};
        const productsCollection = db.collection('products');

        const existingIdsDocs = await productsCollection.find({ id: { $exists: true } }, { projection: { id: 1 } }).toArray();
        let nextId = 1;
        if (existingIdsDocs.length) {
            const numericIds = existingIdsDocs
                .map(d => {
                    const n = parseInt(d.id, 10);
                    return Number.isFinite(n) ? n : 0;
                })
                .filter(n => n >= 0);
            if (numericIds.length) {
                nextId = Math.max(...numericIds) + 1;
            }
        }

        const now = new Date();
        const doc = {
            id: String(nextId),
            name: payload.name || '',
            price: payload.price || 0,
            image: payload.image || '',
            category: payload.category || '',
            brand: payload.brand || '',
            rating: payload.rating || 0,
            description: payload.description || '',
            features: Array.isArray(payload.features) ? payload.features : [],
            colors: Array.isArray(payload.colors) ? payload.colors : [],
            sizes: Array.isArray(payload.sizes) ? payload.sizes : [],
            stock: Array.isArray(payload.stock) ? payload.stock : (Array.isArray(payload.inventory) ? payload.inventory : []),
            weight: payload.weight || '',
            certification: Array.isArray(payload.certification) ? payload.certification : [],
            inStock: payload.inStock !== undefined ? payload.inStock : true,
            createdAt: now,
            updatedAt: now
        };
        await productsCollection.insertOne(doc);

        try {
            if (redis) await redis.del('products:all');
        } catch (redisErr) {
            const e = redisErr; console.warn('Failed to clear redis cache:', e.message || e);
        }

        return res.status(201).json({ data: doc });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create product' });
    }
});

// Cập nhật sản phẩm (Admin only)
router.put('/products/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const payload = req.body || {};
        const productsCollection = db.collection('products');

        const existing = await productsCollection.findOne({ id: String(id) });
        if (!existing) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const updatePayload = { ...payload, updatedAt: new Date() };
        const updateResult = await productsCollection.updateOne(
            { id: String(id) },
            { $set: updatePayload }
        );

        if (updateResult.matchedCount === 0) {
            console.log('[PUT /products/:id] No document matched for update');
            return res.status(404).json({ error: 'Product not found' });
        }

        const updated = await productsCollection.findOne({ id: String(id) });
        if (!updated) {
            console.log('[PUT /products/:id] Failed to fetch updated document');
            return res.status(500).json({ error: 'Failed to fetch updated product' });
        }

        try {
            if (redis) await redis.del('products:all');
        } catch (redisErr) {
            const e = redisErr; console.warn('Failed to clear redis cache:', e.message || e);
        }
        return res.json({ data: updated });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update product' });
    }
});

// Xóa sản phẩm (Admin only)
router.delete('/products/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const productsCollection = db.collection('products');
        const result = await productsCollection.deleteOne({ id: String(id) });
        if (!result.deletedCount) {
            return res.status(404).json({ error: 'Product not found' });
        }
        try {
            if (redis) await redis.del('products:all');
        } catch (redisErr) {
            const e = redisErr; console.warn('Failed to clear redis cache:', e.message || e);
        }
        return res.json({ ok: true, deletedId: id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete product' });
    }
});
export default router;