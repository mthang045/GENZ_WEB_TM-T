import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../app.js';
import { requireAdmin, authMiddleware } from '../middleware/auth.js';
const router = Router();
router.use(authMiddleware);

// Helper: Lấy user từ token
async function getUserFromToken(userIdFromToken) {
    if (!userIdFromToken) return null;
    const usersCollection = db.collection('users');
    return usersCollection.findOne({ _id: new ObjectId(userIdFromToken) });
}

// Helper: Lấy orders theo quyền
async function getOrdersByUser(user) {
    const ordersCollection = db.collection('orders');
    if (user.role === 'admin') {
        return ordersCollection.find({}).sort({ createdAt: -1 }).toArray();
    } else {
        return ordersCollection.find({ "customerInfo.userId": user.userId }).sort({ createdAt: -1 }).toArray();
    }
}

router.get('/orders', async (req, res) => {
    try {
        const userIdFromToken = req.userId;
        if (!userIdFromToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await getUserFromToken(userIdFromToken);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const orders = await getOrdersByUser(user);
        res.json({ data: orders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});
// POST /api/orders (create order - for regular users)
// Helper: Tạo order mới
function buildOrderData(data, userId) {
    const orderId = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-6)}`;
    return {
        orderId,
        items: data.items || [],
        customerInfo: { ...data.customerInfo, userId },
        totalAmount: data.totalAmount || 0,
        shippingCost: data.shippingCost || 0,
        paymentMethod: data.paymentMethod || 'cod',
        paymentStatus: data.paymentStatus || 'pending',
        status: 'pending',
        notes: data.notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
    };
}

router.post('/orders', async (req, res) => {
    try {
        const data = req.body;
        const userIdFromToken = req.userId;
        if (!userIdFromToken) {
            return res.status(401).json({ error: 'Unauthorized - no userId in token' });
        }
        const user = await getUserFromToken(userIdFromToken);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = user.userId;
        const orderData = buildOrderData(data, userId);
        const ordersCollection = db.collection('orders');
        const result = await ordersCollection.insertOne(orderData);
        res.status(201).json({ data: { _id: result.insertedId, ...orderData } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create order' });
    }
});
// GET /api/orders/:id
router.get('/orders/:id', async (req, res) => {
    try {
        const ordersCollection = db.collection('orders');
        const order = await ordersCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!order)
            return res.status(404).json({ error: 'Order not found' });
        res.json({ data: order });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});
// Helper: Giảm inventory khi đơn hàng được giao (COD) hoặc thanh toán thành công (VNPay)
const decrementInventory = async (orderId) => {
    var _a;
    try {
        const ordersCollection = db.collection('orders');
        const productsCollection = db.collection('products');
        const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
        if (!order)
            return false;
        // Giảm inventory cho từng item trong đơn hàng
        for (const item of order.items) {
            const productId = new ObjectId(item.productId);
            const product = await productsCollection.findOne({ _id: productId });
            if (!product) {
                console.warn(`[Inventory] Product ${item.productId} not found`);
                continue;
            }
            // Tìm stock variant (color + size) và giảm quantity
            const stockVariant = (_a = product.stock) === null || _a === void 0 ? void 0 : _a.find((s) => s.color === item.color && s.size === item.size);
            if (stockVariant) {
                const newQuantity = Math.max(0, stockVariant.quantity - item.quantity);
                // Update stock array
                await productsCollection.updateOne({ _id: productId, 'stock.color': item.color, 'stock.size': item.size }, { $set: { 'stock.$.quantity': newQuantity, updatedAt: new Date() } });
                console.log(`[Inventory] Reduced ${item.productName} (${item.color}/${item.size}): ${stockVariant.quantity} → ${newQuantity}`);
            }
            else {
                console.warn(`[Inventory] Stock variant not found for ${item.productName} ${item.color}/${item.size}`);
            }
        }
        return true;
    }
    catch (err) {
        console.error('[Inventory Error]', err);
        return false;
    }
};
// PATCH /api/orders/:id/status
// Khi status → 'delivered' (COD) hoặc order có paymentStatus='completed' (VNPay), giảm inventory
router.patch('/orders/:id/status', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const ordersCollection = db.collection('orders');
        const order = await ordersCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!order)
            return res.status(404).json({ error: 'Order not found' });
        // Cập nhật status
        const result = await ordersCollection.findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { $set: { status, updatedAt: new Date() } }, { returnDocument: 'after' });
        // Nếu status → 'delivered' hoặc 'completed', giảm inventory
        if (status === 'delivered' || status === 'completed') {
            const shouldDecrement = (status === 'delivered' && order.paymentMethod === 'cod') || // COD giao thành công
                (status === 'completed' && order.paymentStatus === 'completed'); // VNPay/Banking đã thanh toán
            if (shouldDecrement) {
                await decrementInventory(req.params.id);
            }
        }
        res.json({ data: result.value });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update status' });
    }
});
export default router;
