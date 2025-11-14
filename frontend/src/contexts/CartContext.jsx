import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { carts as cartsAPI } from '../lib/api';
import { useAuth } from './AuthContext';
import React from 'react';

const CartContext = createContext(undefined);
export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    // Load cart when user changes (login/logout)
    useEffect(() => {
        if (user) {
            loadCart();
        }
        else {
            setCart([]);
        }
    }, [user === null || user === void 0 ? void 0 : user.id]);
    const loadCart = async () => {
        var _a;
        try {
            if (!user) {
                setCart([]);
                return;
            }
            setLoading(true);
            const res = await cartsAPI.get();
            const cartData = res.items || ((_a = res.data) === null || _a === void 0 ? void 0 : _a.items) || [];
            setCart(cartData);
        }
        catch (err) {
            toast.error('Lỗi tải giỏ hàng');
            setCart([]);
        }
        finally {
            setLoading(false);
        }
    };
    const addToCart = async (product, color, size, quantity) => {
        try {
            if (!user) {
                toast.error('Vui lòng đăng nhập!');
                return;
            }
            await cartsAPI.addItem({
                productId: product.id,
                name: product.name,
                image: product.image,
                quantity,
                price: product.price,
                selectedColor: color,
                selectedSize: size
            });
            await loadCart();
            toast.success('Đã thêm sản phẩm vào giỏ hàng!');
        }
        catch (err) {
            toast.error(err.message || 'Không thể thêm sản phẩm');
            console.error('[CartContext] Add to cart error:', err);
        }
    };
    const removeFromCart = async (productId) => {
        try {
            if (!user) {
                toast.error('Vui lòng đăng nhập!');
                return;
            }
            await cartsAPI.removeItem(productId);
            await loadCart();
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng!');
        }
        catch (err) {
            toast.error(err.message || 'Không thể xóa sản phẩm');
        }
    };
    const updateQuantity = async (productId, quantity) => {
        try {
            if (!user) {
                toast.error('Vui lòng đăng nhập!');
                return;
            }
            if (quantity <= 0) {
                await removeFromCart(productId);
                return;
            }
            await cartsAPI.updateItem(productId, { quantity });
            await loadCart();
        }
        catch (err) {
            toast.error(err.message || 'Không thể cập nhật số lượng');
            console.error('[CartContext] Update quantity error:', err);
        }
    };
    const clearCart = async () => {
        try {
            if (!user) {
                toast.error('Vui lòng đăng nhập!');
                return;
            }
            await cartsAPI.clear();
            await loadCart();
            toast.success('Đã xóa toàn bộ giỏ hàng!');
        }
        catch (err) {
            toast.error(err.message || 'Không thể xóa giỏ hàng');
            console.error('[CartContext] Clear cart error:', err);
        }
    };
    const getTotalItems = () => {
        return cart.reduce((total, item) => total + (item.quantity || 0), 0);
    };
    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);
    };
    return (React.createElement(CartContext.Provider, { value: {
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getTotalItems,
            getTotalPrice,
            loading
        } }, children));
}
export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
