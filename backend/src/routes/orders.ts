import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { db } from '../app'
import { requireAdmin, authMiddleware } from '../middleware/auth'

const router = Router()

// Middleware để extract userId từ token
router.use(authMiddleware)

// GET /api/orders
router.get('/orders', async (req, res) => {
  try {
    const ordersCollection = db.collection('orders')
    // Get userId from auth token (if present)
    const userId = (req as any).userId
    
    // If user is authenticated, filter by userId; otherwise return all
    // Convert userId to number for consistent query
    const query = userId ? { userId: parseInt(userId) || userId } : {}
    const orders = await ordersCollection.find(query).sort({ createdAt: -1 }).toArray()
    res.json({ data: orders })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// POST /api/orders (create order - for regular users)
router.post('/orders', async (req, res) => {
  try {
    const data = req.body
    const ordersCollection = db.collection('orders')
    
    // Generate orderId: ORD-YYYYMMDD-XXXXXX
    const orderId = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-6)}`
    
    // Create order with ALL required fields per MongoDB schema
    const orderData = {
      orderId,
      userId: parseInt(data.userId) || 1,
      items: data.items || [],
      customerInfo: data.customerInfo || {},
      totalAmount: data.totalAmount || 0,
      shippingCost: data.shippingCost || 0,
      paymentMethod: data.paymentMethod || 'cod',
      paymentStatus: data.paymentStatus || 'pending',
      status: 'pending',
      notes: data.notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await ordersCollection.insertOne(orderData)
    res.status(201).json({ data: { _id: result.insertedId, ...orderData } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// GET /api/orders/:id
router.get('/orders/:id', async (req, res) => {
  try {
    const ordersCollection = db.collection('orders')
    const order = await ordersCollection.findOne({ _id: new ObjectId(req.params.id) })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json({ data: order })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

// PATCH /api/orders/:id/status
router.patch('/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body
    const ordersCollection = db.collection('orders')
    const result = await ordersCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    if (!result.value) return res.status(404).json({ error: 'Order not found' })
    res.json({ data: result.value })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update status' })
  }
})

export default router
