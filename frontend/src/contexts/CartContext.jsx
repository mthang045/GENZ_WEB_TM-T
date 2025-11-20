import { toast } from 'sonner'
import { createContext, useContext, useState, useEffect } from 'react'
import { carts as cartsAPI } from '../lib/api'
import { useAuth } from './AuthContext'



const CartContext = createContext(undefined)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Load cart when user changes (login/logout)
  useEffect(() => {
    if (user) {
      loadCart()
    } else {
      setCart([])
    }
  }, [user?.id])

  const loadCart = async () => {
    try {
      if (!user) {
        setCart([])
        return
      }

      setLoading(true)
      const res = await cartsAPI.get()
      const cartData = res.items || res.data?.items || []
      setCart(cartData)
    } catch (err) {
      toast.error('L?i t?i gi? h�ng')
      setCart([])
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (product, color, size, quantity) => {
    try {
      if (!user) {
        toast.error('Vui l�ng dang nh?p!')
        return
      }

      await cartsAPI.addItem({
        productId: product.id,
        name: product.name,
        image: product.image,
        quantity,
        price: product.price,
        selectedColor: color,
        selectedSize: size
      })

      await loadCart()
      toast.success('�� th�m s?n ph?m v�o gi? h�ng!')
    } catch (err) {
      toast.error(err.message || 'Kh�ng th? th�m s?n ph?m')
      console.error('[CartContext] Add to cart error:', err)
    }
  }

  const removeFromCart = async (productId) => {
    try {
      if (!user) {
        toast.error('Vui l�ng dang nh?p!')
        return
      }

      await cartsAPI.removeItem(productId)
      await loadCart()
      toast.success('�� x�a s?n ph?m kh?i gi? h�ng!')
    } catch (err) {
      toast.error(err.message || 'Kh�ng th? x�a s?n ph?m')
    }
  }

  const updateQuantity = async (productId, quantity) => {
    try {
      if (!user) {
        toast.error('Vui l�ng dang nh?p!')
        return
      }

      if (quantity <= 0) {
        await removeFromCart(productId)
        return
      }

      await cartsAPI.updateItem(productId, { quantity })
      await loadCart()
    } catch (err) {
      toast.error(err.message || 'Kh�ng th? c?p nh?t s? lu?ng')
      console.error('[CartContext] Update quantity error:', err)
    }
  }

  const clearCart = async () => {
    try {
      if (!user) {
        toast.error('Vui l�ng dang nh?p!')
        return
      }

      await cartsAPI.clear()
      await loadCart()
      toast.success('�� x�a to�n b? gi? h�ng!')
    } catch (err) {
      toast.error(err.message || 'Kh�ng th? x�a gi? h�ng')
      console.error('[CartContext] Clear cart error:', err)
    }
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}


