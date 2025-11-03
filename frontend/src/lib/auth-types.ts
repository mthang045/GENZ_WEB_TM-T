export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  createdAt: string
}

export interface Order {
  _id: string
  orderId: string
  userId: number
  items: {
    productId: string
    productName: string
    quantity: number
    price: number
    color: string
    size: string
  }[]
  customerInfo: {
    name: string
    email: string
    phone: string
    address: string
  }
  totalAmount: number
  shippingCost: number
  paymentMethod: 'cod' | 'banking'
  paymentStatus: 'pending' | 'paid' | 'failed'
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
  notes: string
  createdAt: string
  updatedAt: string
}
