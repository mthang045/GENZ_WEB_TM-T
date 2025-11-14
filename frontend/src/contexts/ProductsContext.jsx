import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { products as api } from '../lib/api';
import React from 'react';

const ProductsContext = createContext(undefined);
export function ProductsProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(undefined);
    // Load products from API
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                setLoading(true);
                const res = await api.list();
                console.log('[ProductsContext] API Response:', res);
                const data = res.data || res;
                console.log('[ProductsContext] Parsed data:', data);
                if (!mounted)
                    return;
                setProducts(Array.isArray(data) ? data : []);
            }
            catch (err) {
                console.error('[ProductsContext] Failed to load products from API', err);
                setError((err === null || err === void 0 ? void 0 : err.message) || String(err));
                setProducts([]);
            }
            finally {
                setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);
    const addProduct = (productData) => {
        const newProduct = Object.assign(Object.assign({}, productData), { id: `product-${Date.now()}` });
        const updatedProducts = [...products, newProduct];
        setProducts(updatedProducts);
        toast.success('Thêm sản phẩm thành công!');
    };
    const updateProduct = (id, productData) => {
        const updatedProducts = products.map(product => product.id === id ? Object.assign(Object.assign({}, product), productData) : product);
        setProducts(updatedProducts);
        toast.success('Cập nhật sản phẩm thành công!');
    };
    const deleteProduct = (id) => {
        const updatedProducts = products.filter(product => product.id !== id);
        setProducts(updatedProducts);
        toast.success('Xóa sản phẩm thành công!');
    };
    return (React.createElement(ProductsContext.Provider, { value: {
            products,
            addProduct,
            updateProduct,
            deleteProduct,
            loading,
            error
        } }, children));
}
export function useProducts() {
    const context = useContext(ProductsContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductsProvider');
    }
    return context;
}
