import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { User, Order } from '../lib/auth-types'
import { auth as apiAuth, orders as apiOrders } from '../lib/api'
import { CartItem } from '../lib/types'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isAdmin: () => boolean
  orders: Order[]
    addOrder: (order: Omit<Order, '_id' | 'orderId' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>
  updateOrderStatus: (orderId: string, status: Order['status']) => void
  getUserOrders: () => Order[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])

  // Load user from localStorage and orders from API on mount
  useEffect(() => {
    // Clean up old localStorage keys
    localStorage.removeItem('genz_products')

    // Load token AND user from localStorage FIRST
    const savedToken = localStorage.getItem('genz_token')
    const savedUser = localStorage.getItem('genz_user')
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (err) {
        console.error('Failed to parse saved user:', err)
      }
    }

    // Load orders from API (will use token from localStorage)
    const loadOrders = async () => {
      try {
        const res = await apiOrders.list()
        const data = res.data || res
        setOrders(data)
      } catch (err: any) {
        console.error('Failed to load orders from API', err)
      } finally {
        // Mark loading as done after trying to load orders (with or without error)
        setLoading(false)
      }
    }

    if (savedToken && savedUser) {
      loadOrders()
    } else {
      // No saved session, mark loading as done immediately
      setLoading(false)
    }
  }, [])

  const loadOrdersFromAPI = async () => {
    try {
      const res = await apiOrders.list()
      const data = res.data || res
      setOrders(data)
    } catch (err: any) {
      console.error('Failed to reload orders:', err)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiAuth.login({ email, password })
      // Expect response { token, user }
      if (res.token) {
        localStorage.setItem('genz_token', res.token)
        localStorage.setItem('genz_user', JSON.stringify(res.user))
        setUser(res.user)
        await loadOrdersFromAPI()
        toast.success('Đăng nhập thành công!')
        return true
      }
      toast.error('Đăng nhập thất bại')
      return false
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi đăng nhập')
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const res = await apiAuth.register({ email, password, name })
      if (res.token) {
        localStorage.setItem('genz_token', res.token)
        localStorage.setItem('genz_user', JSON.stringify(res.user))
        setUser(res.user)
        await loadOrdersFromAPI()
        toast.success('Đăng ký thành công!')
        return true
      }
      toast.error('Đăng ký thất bại')
      return false
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi đăng ký')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('genz_user')
    localStorage.removeItem('genz_token')
    toast.success('Đăng xuất thành công!')
  }

  const isAdmin = (): boolean => {
    return user?.role === 'admin'
  }

  const addOrder = async (orderData: Omit<Order, '_id' | 'orderId' | 'createdAt' | 'updatedAt' | 'status'>) => {
    try {
      const res = await apiOrders.create({
        items: orderData.items,
        customerInfo: orderData.customerInfo,
        totalAmount: orderData.totalAmount,
        shippingCost: orderData.shippingCost,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentStatus,
        notes: orderData.notes
      })
      
      const newOrder = res.data || res
      setOrders(prev => [...prev, newOrder])
      toast.success('Đặt hàng thành công!')
      
      // Reload orders from API to stay in sync
      try {
        const listRes = await apiOrders.list()
        setOrders(listRes.data || listRes)
      } catch (err) {
        console.warn('Failed to reload orders after creating:', err)
      }
    } catch (err: any) {
      console.error('Failed to create order:', err)
      toast.error('Lỗi khi đặt hàng: ' + (err?.message || String(err)))
      throw err
    }
  }

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updatedOrders = orders.map(order => 
      order._id === orderId ? { ...order, status } : order
    )
    setOrders(updatedOrders)
    toast.success('Cập nhật trạng thái đơn hàng thành công!')
  }

  const getUserOrders = (): Order[] => {
    if (!user) return []
    // Filter orders by userId (numeric) in customerInfo
    return orders.filter(order => order.customerInfo.userId === user.userId)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin,
        orders,
        addOrder,
        updateOrderStatus,
        getUserOrders
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
