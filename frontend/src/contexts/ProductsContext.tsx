import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { Product } from '../lib/types'
import { toast } from 'sonner'
import { products as api } from '../lib/api'

interface ProductsContextType {
  products: Product[]
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  loading: boolean
  error?: string
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)

  // Load products from API
  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        const res = await api.list()
        console.log('[ProductsContext] API Response:', res)
        const data = res.data || res
        console.log('[ProductsContext] Parsed data:', data)
        if (!mounted) return
        setProducts(Array.isArray(data) ? data : [])
      } catch (err: any) {
        console.error('[ProductsContext] Failed to load products from API', err)
        setError(err?.message || String(err))
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}`
    }
    const updatedProducts = [...products, newProduct]
    setProducts(updatedProducts)
    toast.success('Thêm sản phẩm thành công!')
  }

  const updateProduct = (id: string, productData: Partial<Product>) => {
    const updatedProducts = products.map(product =>
      product.id === id ? { ...product, ...productData } : product
    )
    setProducts(updatedProducts)
    toast.success('Cập nhật sản phẩm thành công!')
  }

  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id)
    setProducts(updatedProducts)
    toast.success('Xóa sản phẩm thành công!')
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct
        ,
        loading,
        error
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider')
  }
  return context
}
