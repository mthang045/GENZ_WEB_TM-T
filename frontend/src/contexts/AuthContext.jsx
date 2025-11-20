import { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { auth as apiAuth, orders as apiOrders } from '../lib/api'



const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])

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
      } catch (err) {
        console.error('Failed to load orders from API', err)
      } finally {
        // Mark loading after trying to load orders (with or without error)
        setLoading(false)
      }
    }

    if (savedToken && savedUser) {
      loadOrders()
    } else {
      // No saved session, mark loading immediately
      setLoading(false)
    }
  }, [])

  const loadOrdersFromAPI = async () => {
    try {
      const res = await apiOrders.list()
      const data = res.data || res
      setOrders(data)
    } catch (err) {
      console.error('Failed to reload orders:', err)
    }
  }

  const login = async (email, password) => {
    try {
      const res = await apiAuth.login({ email, password })
      // Expect response { token, user }
      if (res.token) {
        localStorage.setItem('genz_token', res.token)
        localStorage.setItem('genz_user', JSON.stringify(res.user))
        setUser(res.user)
        await loadOrdersFromAPI()
        toast.success('�ang nh?p th�nh c�ng!')
        return true
      }
      toast.error('�ang nh?p th?t b?i')
      return false
    } catch (err) {
      toast.error(err?.message || 'L?i khi dang nh?p')
      return false
    }
  }

  const register = async (email, password, name) => {
    try {
      const res = await apiAuth.register({ email, password, name })
      if (res.token) {
        localStorage.setItem('genz_token', res.token)
        localStorage.setItem('genz_user', JSON.stringify(res.user))
        setUser(res.user)
        await loadOrdersFromAPI()
        toast.success('�ang k� th�nh c�ng!')
        return true
      }
      toast.error('�ang k� th?t b?i')
      return false
    } catch (err) {
      toast.error(err?.message || 'L?i khi dang k�')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('genz_user')
    localStorage.removeItem('genz_token')
    toast.success('�ang xu?t th�nh c�ng!')
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const addOrder = async (orderData) => {
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
      toast.success('�?t h�ng th�nh c�ng!')
      
      // Reload orders from API to stay in sync
      try {
        const listRes = await apiOrders.list()
        setOrders(listRes.data || listRes)
      } catch (err) {
        console.warn('Failed to reload orders after creating:', err)
      }
    } catch (err) {
      console.error('Failed to create order:', err)
      toast.error('L?i khi d?t h�ng: ' + (err?.message || String(err)))
      throw err
    }
  }

  const updateOrderStatus = (orderId, status) => {
    const updatedOrders = orders.map(order => 
      order._id === orderId ? { ...order, status } : order
    )
    setOrders(updatedOrders)
    toast.success('C?p nh?t tr?ng th�i don h�ng th�nh c�ng!')
  }

  const getUserOrders = () => {
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

