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
    // Get _id from auth token
    const userIdFromToken = (req as any).userId
    
    if (!userIdFromToken) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Query user collection to get userId field (int) and role
    const usersCollection = db.collection('users')
    const user = await usersCollection.findOne({ _id: new ObjectId(userIdFromToken) })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // If admin, return all orders. If regular user, filter by userId
    let orders
    if (user.role === 'admin') {
      // Admin sees all orders
      orders = await ordersCollection.find({}).sort({ createdAt: -1 }).toArray()
    } else {
      // Regular user sees only their orders
      const userId = user.userId // This is the numeric userId (int)
      orders = await ordersCollection.find({ "customerInfo.userId": userId }).sort({ createdAt: -1 }).toArray()
    }
    
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
    
    // Get _id from JWT token
    const userIdFromToken = (req as any).userId
    if (!userIdFromToken) {
      return res.status(401).json({ error: 'Unauthorized - no userId in token' })
    }

    // Query user collection to get userId field (int)
    const usersCollection = db.collection('users')
    const user = await usersCollection.findOne({ _id: new ObjectId(userIdFromToken) })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const userId = user.userId // This is the numeric userId (int)
    
    // Generate orderId: ORD-YYYYMMDD-XXXXXX
    const orderId = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-6)}`
    
    // Create order with ALL required fields per MongoDB schema
    const orderData = {
      orderId,
      items: data.items || [],
      customerInfo: {
        userId,
        ...data.customerInfo
      },
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

// Helper: Giảm inventory khi đơn hàng được giao (COD) hoặc thanh toán thành công (VNPay)
const decrementInventory = async (orderId: string) => {
  try {
    const ordersCollection = db.collection('orders')
    const productsCollection = db.collection('products')
    
    const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) })
    if (!order) return false
    
    // Giảm inventory cho từng item trong đơn hàng
    for (const item of order.items) {
      const productId = new ObjectId(item.productId)
      const product = await productsCollection.findOne({ _id: productId })
      
      if (!product) {
        console.warn(`[Inventory] Product ${item.productId} not found`)
        continue
      }
      
      // Tìm stock variant (color + size) và giảm quantity
      const stockVariant = product.stock?.find(
        (s: any) => s.color === item.color && s.size === item.size
      )
      
      if (stockVariant) {
        const newQuantity = Math.max(0, stockVariant.quantity - item.quantity)
        
        // Update stock array
        await productsCollection.updateOne(
          { _id: productId, 'stock.color': item.color, 'stock.size': item.size },
          { $set: { 'stock.$.quantity': newQuantity, updatedAt: new Date() } }
        )
        
        console.log(`[Inventory] Reduced ${item.productName} (${item.color}/${item.size}): ${stockVariant.quantity} → ${newQuantity}`)
      } else {
        console.warn(`[Inventory] Stock variant not found for ${item.productName} ${item.color}/${item.size}`)
      }
    }
    return true
  } catch (err) {
    console.error('[Inventory Error]', err)
    return false
  }
}

// PATCH /api/orders/:id/status
// Khi status → 'delivered' (COD) hoặc order có paymentStatus='completed' (VNPay), giảm inventory
router.patch('/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body
    const ordersCollection = db.collection('orders')
    
    const order = await ordersCollection.findOne({ _id: new ObjectId(req.params.id) })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    
    // Cập nhật status
    const result = await ordersCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    
    // Nếu status → 'delivered' hoặc 'completed', giảm inventory
    if (status === 'delivered' || status === 'completed') {
      const shouldDecrement = 
        (status === 'delivered' && order.paymentMethod === 'cod') || // COD giao thành công
        (status === 'completed' && order.paymentStatus === 'completed') // VNPay/Banking đã thanh toán
      
      if (shouldDecrement) {
        await decrementInventory(req.params.id)
      }
    }
    
    res.json({ data: result.value })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update status' })
  }
})

export default router
