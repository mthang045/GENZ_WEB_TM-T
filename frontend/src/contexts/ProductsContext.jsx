// This file has been modified to remove BOM
// This file has been modified to remove BOM
import { toast } from 'sonner'
import { createContext, useContext, useState, useEffect } from 'react'
import { products as productsAPI } from '../lib/api'

const ProductsContext = createContext(undefined)

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(undefined)

  // Load products from API
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const res = await productsAPI.list();
        // API trả về {data: [...]} hoặc [...]
        let data = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : []);
        if (!mounted) return;
        setProducts(data);
      } catch (err) {
        console.error('[ProductsContext] Failed to load products from API', err);
        setError(err?.message || String(err));
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);
  const addProduct = (productData) => {
    const newProduct = {
      ...productData,
      id: `product-${Date.now()}`
    }
    const updatedProducts = [...products, newProduct]
    setProducts(updatedProducts)
    toast.success('Thêm sản phẩm thành công!')
  }

  const updateProduct = (id, productData) => {
    const updatedProducts = products.map(product =>
      product.id === id ? { ...product, ...productData } : product
    )
    setProducts(updatedProducts)
    toast.success('Cập nhật sản phẩm thành công!')
  }

  const deleteProduct = (id) => {
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

