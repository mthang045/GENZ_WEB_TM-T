import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { db, redis } from '../app';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

interface CartItem {
  _id?: string;
  productId: string;
  name?: string;
  image?: string;
  quantity: number;
  price: number;
  subtotal?: number;
  selectedColor?: string;
  selectedSize?: string;
  addedAt?: Date;
}

// Helper: tính tổng giá của items
function calculateTotalPrice(items: CartItem[]): number {
  if (!items || items.length === 0) return 0;
  
  const total = items.reduce((sum, item) => {
    // Luôn tính từ quantity * price, bỏ qua subtotal
    const itemPrice = (item.quantity || 0) * (item.price || 0);
    return sum + itemPrice;
  }, 0);
  
  return Math.round(total * 100) / 100; // Làm tròn 2 chữ số thập phân
}

// Get cart for current user - lấy từ collection 'carts'
router.get('/carts', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const cartKey = `cart:${userId}`;
    
    // Try to get from Redis first
    try {
      const cachedCart = await redis.get(cartKey);
      if (cachedCart) {
        const parsed = JSON.parse(cachedCart);
        return res.json(parsed);
      }
    } catch (redisErr) {
      // Redis unavailable, continue to DB
    }

    // Get from MongoDB carts collection
    const cartDoc = await db.collection('carts').findOne({ userId });
    const items = cartDoc?.items || [];
    const totalPrice = calculateTotalPrice(items);

    // Cache in Redis
    try {
      await redis.setex(cartKey, 86400, JSON.stringify({ items, totalPrice }));
    } catch (redisErr) {
      // Fail silently
    }

    res.json({ items, totalPrice });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// Add item to cart
router.post('/carts/items', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const { productId, name, image, quantity, price, selectedColor, selectedSize } = req.body;

    if (!productId || !quantity || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cartItem: CartItem = {
      _id: `${productId}-${Date.now()}`,
      productId,
      name: name || 'Unknown Product',
      image: image || '',
      quantity: parseInt(quantity),
      price: parseFloat(price),
      subtotal: parseInt(quantity) * parseFloat(price),
      selectedColor: selectedColor || '',
      selectedSize: selectedSize || '',
      addedAt: new Date()
    };

    // Update in MongoDB carts collection
    const result = await db.collection('carts').findOneAndUpdate(
      { userId },
      {
        $push: { items: cartItem },
        $set: { updatedAt: new Date() }
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Get the updated document and recalculate totalPrice
    const cartDoc = await db.collection('carts').findOne({ userId });
    const allItems = cartDoc?.items || [];
    const totalPrice = calculateTotalPrice(allItems);

    // Always update totalPrice
    await db.collection('carts').updateOne(
      { userId },
      { $set: { totalPrice, updatedAt: new Date() } }
    );

    // Invalidate cache
    try {
      await redis.del(`cart:${userId}`);
    } catch (redisErr) {
      // Fail silently
    }

    res.json({ success: true, message: 'Item added to cart', totalPrice });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update cart item quantity
router.put('/carts/items/:productId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    if (quantity === 0) {
      // Remove item
      await db.collection('carts').updateOne(
        { userId },
        { $pull: { items: { productId } }, $set: { updatedAt: new Date() } }
      );
    } else {
      // First get the item to get price
      const cartDoc = await db.collection('carts').findOne({ userId });
      const item = cartDoc?.items?.find((i: CartItem) => i.productId === productId);
      const price = item?.price || 0;
      
      // Update quantity and subtotal
      await db.collection('carts').updateOne(
        { userId, 'items.productId': productId },
        { $set: { 'items.$.quantity': quantity, 'items.$.subtotal': quantity * price, updatedAt: new Date() } }
      );
    }

    // Get updated cart and calculate totalPrice
    const updatedCartDoc = await db.collection('carts').findOne({ userId });
    const totalPrice = calculateTotalPrice(updatedCartDoc?.items || []);
    
    // Update totalPrice
    await db.collection('carts').updateOne(
      { userId },
      { $set: { totalPrice } }
    );

    // Invalidate cache
    try {
      await redis.del(`cart:${userId}`);
    } catch (redisErr) {
      // Fail silently
    }

    res.json({ success: true, message: 'Cart updated', totalPrice });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from cart
router.delete('/carts/items/:productId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const { productId } = req.params;

    await db.collection('carts').updateOne(
      { userId },
      { $pull: { items: { productId } }, $set: { updatedAt: new Date() } }
    );

    // Get updated cart and calculate totalPrice
    const cartDoc = await db.collection('carts').findOne({ userId });
    const totalPrice = calculateTotalPrice(cartDoc?.items || []);
    
    // Update totalPrice
    await db.collection('carts').updateOne(
      { userId },
      { $set: { totalPrice } }
    );

    // Invalidate cache
    try {
      await redis.del(`cart:${userId}`);
    } catch (redisErr) {
      // Fail silently
    }

    res.json({ success: true, message: 'Item removed from cart', totalPrice });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Clear entire cart
router.delete('/carts', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;

    await db.collection('carts').updateOne(
      { userId },
      { $set: { items: [], totalPrice: 0, updatedAt: new Date() } },
      { upsert: true }
    );

    // Invalidate cache
    try {
      await redis.del(`cart:${userId}`);
    } catch (redisErr) {
      // Fail silently
    }

    res.json({ success: true, message: 'Cart cleared', totalPrice: 0 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
