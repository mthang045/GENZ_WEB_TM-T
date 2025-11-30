
import { Router } from 'express';
import { db } from '../app.js';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const router = Router();

// DEBUG: Echo route for troubleshooting header/body issues (no auth)
router.all('/debug/echo', (req, res) => {
    console.log('DEBUG ECHO ROUTE HIT', {
        method: req.method,
        headers: req.headers,
        body: req.body,
        query: req.query
    });
    res.json({
        echo: true,
        method: req.method,
        headers: req.headers,
        body: req.body,
        query: req.query,
        env_DEBUG_KEY: process.env.DEBUG_KEY,
        message: 'If you see this, /debug/echo route handler ran.'
    });
});
// POST /api/debug/promote { email }
router.post('/debug/promote', async (req, res) => {
    var _a;
    const key = req.headers['x-debug-key'] || req.body.debugKey;
    if (!key || key !== process.env.DEBUG_KEY)
        return res.status(403).json({ error: 'Forbidden' });
    const { email } = req.body;
    if (!email)
        return res.status(400).json({ error: 'Missing email' });
    try {
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ email });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const result = await usersCollection.findOneAndUpdate({ email }, { $set: { role: 'admin', updatedAt: new Date() } }, { returnDocument: 'after' });
        res.json({ ok: true, email: (_a = result.value) === null || _a === void 0 ? void 0 : _a.email });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed' });
    }
});
// POST /api/debug/reset-products - Reload products from genz.products.json
router.post('/debug/reset-products', async (req, res) => {
        try {
            console.log('--- DEBUG /debug/reset-products ---');
            console.log('Headers:', req.headers);
            console.log('Body:', req.body);
            console.log('process.env.DEBUG_KEY:', process.env.DEBUG_KEY);
        } catch (err) {
            console.log('LOG ERROR:', err);
        }
    const key = req.headers['x-debug-key'] || req.body.debugKey;
    if (!key || key !== process.env.DEBUG_KEY) {
        console.log('Key mismatch:', key, process.env.DEBUG_KEY);
        return res.status(403).json({ error: 'Forbidden', key, env: process.env.DEBUG_KEY });
    }
    try {
        const productsFilePath = path.join(__dirname, '../../data/genz.products.json');
        const jsonData = fs.readFileSync(productsFilePath, 'utf-8');
        let products = JSON.parse(jsonData);
        // Chuyển đổi _id: { $oid: ... } thành _id: new ObjectId(...)
        products = products.map((p) => {
            if (p._id && p._id.$oid) {
                p._id = new ObjectId(p._id.$oid);
            }
            return p;
        });
        const productsCollection = db.collection('products');
        // Clear existing products
        await productsCollection.deleteMany({});
        // Insert new products
        const result = await productsCollection.insertMany(products);
        res.json({ ok: true, inserted: result.insertedCount });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to reset products' });
    }
});
export default router;
