// This file is intended to be free of BOM
import { ArrowLeft, ShoppingBag, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { useCart } from '../contexts/CartContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function CartPage({ onBack, onCheckout }) {
    const { cart, updateQuantity, removeFromCart, getTotalPrice } = useCart();
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <Button variant="ghost" onClick={onBack} className="mb-6 hover:text-pink-500">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Tiếp Tục Mua Sắm
                </Button>
                <h1 className="text-3xl mb-8 flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8" />
                    Giỏ Hàng Của Bạn
                </h1>
                {cart.length === 0 ? (
                    <Card className="text-center py-16">
                        <CardContent>
                            <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                            <h2 className="text-2xl mb-4">Giỏ hàng trống</h2>
                            <p className="text-gray-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                            <Button onClick={onBack} className="bg-pink-500 hover:bg-pink-600">
                                Khám Phá Sản Phẩm
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Sản phẩm ({cart.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {cart.map((item) => (
                                        <div key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-4 p-4 border rounded-lg hover:border-pink-200 transition-colors">
                                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div>
                                                    <h3 className="line-clamp-1">{item.name}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        Màu: {item.selectedColor} • Size: {item.selectedSize}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => updateQuantity(`${item.productId}-${item.selectedColor}-${item.selectedSize}`, item.quantity - 1)}>
                                                            <Minus className="w-4 h-4" />
                                                        </Button>
                                                        <span className="w-12 text-center">{item.quantity}</span>
                                                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => updateQuantity(`${item.productId}-${item.selectedColor}-${item.selectedSize}`, item.quantity + 1)} disabled={item.quantity >= 10}>
                                                            <Plus className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-pink-500">{formatPrice(item.price * item.quantity)}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatPrice(item.price)}/cái
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 self-start" onClick={() => removeFromCart(`${item.productId}-${item.selectedColor}-${item.selectedSize}`)}>
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex gap-3">
                                        <input type="text" placeholder="Nhập mã giảm giá" className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                                        <Button variant="outline" className="hover:border-pink-500">Áp Dụng</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div>
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle>Tổng Đơn Hàng</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Tạm tính</span>
                                            <span>{formatPrice(getTotalPrice())}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Phí vận chuyển</span>
                                            <span className="text-green-600">Miễn phí</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Giảm giá</span>
                                            <span>0đ</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between">
                                            <span>Tổng cộng</span>
                                            <span className="text-pink-500">{formatPrice(getTotalPrice())}</span>
                                        </div>
                                    </div>
                                    <Button size="lg" className="w-full bg-pink-500 hover:bg-pink-600 text-white" onClick={onCheckout}>
                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                        Tiến Hành Thanh Toán
                                    </Button>
                                    <Button variant="outline" size="lg" className="w-full" onClick={onBack}>
                                        Tiếp Tục Mua Hàng
                                    </Button>
                                    <div className="pt-4 space-y-3 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span>Miễn phí vận chuyển toàn quốc</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span>Đổi trả trong 30 ngày</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span>Bảo hành chính hãng</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}