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
        // Chuẩn hóa id để frontend dùng thống nhất
        data = data
          .filter((p) => p && typeof p === 'object')
          .map((p) => ({ ...p, id: String(p.id || p._id || '') }));
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
  const addProduct = async (productData) => {
    try {
      const res = await productsAPI.create(productData)
      const created = res?.data || res
      const normalized = { ...created, id: String(created.id || created._id || '') }
      setProducts((prev) => [...(Array.isArray(prev) ? prev : []), normalized])
      toast.success('Thêm sản phẩm thành công!')
      // Optional: reload to ensure consistency
      try {
        const listRes = await productsAPI.list()
        let data = Array.isArray(listRes) ? listRes : (Array.isArray(listRes.data) ? listRes.data : [])
        data = data
          .filter((p) => p && typeof p === 'object')
          .map((p) => ({ ...p, id: String(p.id || p._id || '') }))
        setProducts(data)
      } catch (reloadErr) {
        console.warn('[ProductsContext] Reload after create failed', reloadErr)
      }
    } catch (err) {
      console.error('[ProductsContext] Failed to create product', err)
      toast.error('Thêm sản phẩm thất bại!')
      throw err
    }
  }

  const updateProduct = async (id, productData) => {
    try {
      const res = await productsAPI.update(id, productData)
      const updated = res?.data || res
      const updatedId = String(updated.id || id)
      const next = (Array.isArray(products) ? products : [])
        .map((p) => (String(p.id) === updatedId ? { ...p, ...updated, id: updatedId } : p))
      setProducts(next)
      toast.success('Cập nhật sản phẩm thành công!')
    } catch (err) {
      console.error('[ProductsContext] Failed to update product', err)
      toast.error('Cập nhật sản phẩm thất bại!')
      throw err
    }
  }

  const deleteProduct = async (id) => {
    try {
      await productsAPI.delete(id)
      const updatedProducts = (Array.isArray(products) ? products : [])
        .filter((product) => String(product.id) !== String(id))
      setProducts(updatedProducts)
      toast.success('Xóa sản phẩm thành công!')
    } catch (err) {
      console.error('[ProductsContext] Failed to delete product', err)
      toast.error('Xóa sản phẩm thất bại!')
    }
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

