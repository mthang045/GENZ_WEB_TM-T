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

  // Load products from localStorage or use initial data
  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        const res = await api.list()
        // API wrapper returns { source, data }
        const data = res.data || res
        if (!mounted) return
        setProducts(data)
        localStorage.setItem('genz_products', JSON.stringify(data))
      } catch (err: any) {
        console.error('Failed to load products from API, falling back to local', err)
        setError(err?.message || String(err))
        const savedProducts = localStorage.getItem('genz_products')
        if (savedProducts) {
          setProducts(JSON.parse(savedProducts))
        } else {
          // If no API and no cache, show empty state
          setProducts([])
        }
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts)
    localStorage.setItem('genz_products', JSON.stringify(newProducts))
  }

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}`
    }
    const updatedProducts = [...products, newProduct]
    saveProducts(updatedProducts)
    toast.success('Thêm sản phẩm thành công!')
  }

  const updateProduct = (id: string, productData: Partial<Product>) => {
    const updatedProducts = products.map(product =>
      product.id === id ? { ...product, ...productData } : product
    )
    saveProducts(updatedProducts)
    toast.success('Cập nhật sản phẩm thành công!')
  }

  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id)
    saveProducts(updatedProducts)
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
