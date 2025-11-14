export /**`n * @typedef {Object} User
  id: string
  email: string
  name: string
  userId?: number
  role: 'admin' | 'user'
  createdAt: string
}

export /**`n * @typedef {Object} Order
  _id: string
  orderId: string
  items: {
    productId: string
    productName: string
    quantity: number
    price: number
    color: string
    size: string
  }[]
  customerInfo: {
    userId?: number
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

