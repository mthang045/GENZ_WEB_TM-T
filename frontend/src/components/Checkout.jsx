import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, CreditCard, Truck, CheckCircle2, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../lib/api';


export function Checkout({ onBack, onSuccess }) {
    const { cart, getTotalPrice, clearCart } = useCart();
    const { user, addOrder } = useAuth();
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        note: '',
        paymentMethod: 'cod'
    });
    const [showBankingInfo, setShowBankingInfo] = useState(false);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Show banking info if banking method is selected
        if (name === 'paymentMethod') {
            setShowBankingInfo(value === 'banking');
        }
    };

    const handleVNPayPayment = async (orderId, amount) => {
        try {
            setIsProcessing(true);
            const response = await apiFetch('api/vnpay/create-payment', {
                method: 'POST',
                body: JSON.stringify({
                    orderId,
                    orderDescription: `Payment for order ${orderId}`,
                    returnUrl: `http://localhost:4000/api/vnpay/return` // Backend URL để xử lý
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.success && response.paymentUrl) {
                // Redirect to VNPay payment gateway
                window.location.href = response.paymentUrl;
            } else {
                toast.error('Lỗi tạo URL thanh toán!');
            }
        } catch (error) {
            console.error('VNPay payment error:', error);
            toast.error('Lỗi khi kết nối VNPay');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.phone || !formData.address) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }
        try {
            setIsProcessing(true);
            // Chỉ tạo order khi không dùng VNPay
            // Nếu dùng VNPay, tạo order ở sau khi thanh toán thành công
            if (formData.paymentMethod !== 'vnpay') {
                // Create order directly via API
                const orderResponse = await apiFetch('api/orders', {
                    method: 'POST',
                    body: JSON.stringify({
                        items: cart.map(item => ({
                            productId: item.id,
                            productName: item.name,
                            quantity: item.quantity,
                            price: item.price,
                            color: item.selectedColor,
                            size: item.selectedSize
                        })),
                        customerInfo: {
                            name: formData.fullName,
                            email: formData.email || 'N/A',
                            phone: formData.phone,
                            address: formData.address
                        },
                        totalAmount: getTotalPrice(),
                        shippingCost: 0,
                        paymentMethod: formData.paymentMethod,
                        paymentStatus: 'pending',
                        notes: formData.note
                    }),
                    headers: { 'Content-Type': 'application/json' }
                });
                setCreatedOrderId(orderResponse.data._id);
                setOrderPlaced(true);
                // Clear cart after 2 seconds
                setTimeout(() => {
                    clearCart();
                }, 2000);
            } else {
                // Với VNPay, tạo order rồi gọi create-payment
                const orderResponse = await apiFetch('api/orders', {
                    method: 'POST',
                    body: JSON.stringify({
                        items: cart.map(item => ({
                            productId: item.id,
                            productName: item.name,
                            quantity: item.quantity,
                            price: item.price,
                            color: item.selectedColor,
                            size: item.selectedSize
                        })),
                        customerInfo: {
                            name: formData.fullName,
                            email: formData.email || 'N/A',
                            phone: formData.phone,
                            address: formData.address
                        },
                        totalAmount: getTotalPrice(),
                        shippingCost: 0,
                        paymentMethod: 'vnpay',
                        paymentStatus: 'pending',
                        notes: formData.note
                    }),
                    headers: { 'Content-Type': 'application/json' }
                });
                const orderId = orderResponse.data._id;
                setCreatedOrderId(orderId);
                // Gọi VNPay payment
                await handleVNPayPayment(orderId, getTotalPrice());
            }
        } catch (err) {
            console.error('Order creation error:', err);
            toast.error('Lỗi tạo đơn hàng');
        } finally {
            setIsProcessing(false);
        }
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <Card className="max-w-2xl mx-auto text-center">
                        <CardContent className="pt-12 pb-12">
                            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                            <h2 className="text-3xl mb-4">Đặt Hàng Thành Công!</h2>
                            <p className="text-gray-600 mb-2">Cảm ơn bạn đã mua hàng tại GENZ Helmets.</p>
                            <p className="text-gray-600 mb-2">
                                {formData.paymentMethod === 'banking'
                                    ? 'Vui lòng chuyển khoản theo thông tin đã cung cấp. Đơn hàng sẽ được xử lý sau khi nhận được thanh toán.'
                                    : 'Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận đơn hàng.'}
                            </p>
                            <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left max-w-md mx-auto">
                                <h4 className="mb-3">Thông tin đơn hàng:</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Mã đơn hàng:</span>
                                        <span>
                                            #{Math.floor(Math.random() * 1000000)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tổng tiền:</span>
                                        <span className="text-pink-500">{formatPrice(getTotalPrice())}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phương thức:</span>
                                        <span>{formData.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}</span>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={onSuccess} className="bg-pink-500 hover:bg-pink-600 mt-8">
                                Về Trang Chủ
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <Button variant="ghost" onClick={onBack} className="mb-6 hover:text-pink-500">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay Lại
                </Button>
                <h1 className="text-3xl mb-8">Thanh Toán</h1>
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="w-5 h-5" />
                                    Thông Tin Giao Hàng
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Họ và tên *</Label>
                                            <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Nguyễn Văn A" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Số điện thoại *</Label>
                                            <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="0901234567" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="email@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Địa chỉ giao hàng *</Label>
                                        <Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố" rows={3} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
                                        <Textarea id="note" name="note" value={formData.note} onChange={handleInputChange} placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn" rows={3} />
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Phương Thức Thanh Toán
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-pink-500 transition-colors ${formData.paymentMethod === 'cod' ? 'border-pink-500 bg-pink-50' : ''}`}>
                                        <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} className="text-pink-500" />
                                        <div className="flex-1">
                                            <div>Thanh toán khi nhận hàng (COD)</div>
                                            <div className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</div>
                                        </div>
                                    </label>
                                    <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-pink-500 transition-colors ${formData.paymentMethod === 'banking' ? 'border-pink-500 bg-pink-50' : ''}`}>
                                        <input type="radio" name="paymentMethod" value="banking" checked={formData.paymentMethod === 'banking'} onChange={handleInputChange} className="text-pink-500" />
                                        <div className="flex-1">
                                            <div>Chuyển khoản ngân hàng</div>
                                            <div className="text-sm text-gray-500">Chuyển khoản qua Internet Banking hoặc QR Code</div>
                                        </div>
                                    </label>
                                    <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-pink-500 transition-colors ${formData.paymentMethod === 'vnpay' ? 'border-pink-500 bg-pink-50' : ''}`}>
                                        <input type="radio" name="paymentMethod" value="vnpay" checked={formData.paymentMethod === 'vnpay'} onChange={handleInputChange} className="text-pink-500" />
                                        <div className="flex-1">
                                            <div>Thanh toán VNPay</div>
                                            <div className="text-sm text-gray-500">Thanh toán trực tuyến an toàn qua VNPay</div>
                                        </div>
                                    </label>
                                    {showBankingInfo && (
                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                                            <h4 className="text-sm">Thông tin chuyển khoản:</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Ngân hàng:</span>
                                                    <span>Vietcombank</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Số tài khoản:</span>
                                                    <span className="select-all">1234567890</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Chủ tài khoản:</span>
                                                    <span>CÔNG TY GENZ</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Số tiền:</span>
                                                    <span className="text-pink-500">{formatPrice(getTotalPrice())}</span>
                                                </div>
                                                <div className="flex justify-between items-start">
                                                    <span className="text-gray-600">Nội dung:</span>
                                                    <span className="text-right select-all">GENZ [Số điện thoại]</span>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="text-xs text-gray-600">
                                                <p>✓ Vui lòng chuyển khoản đúng nội dung để được xử lý nhanh nhất</p>
                                                <p>✓ Đơn hàng sẽ được xác nhận sau khi nhận được thanh toán</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div>
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Đơn Hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {cart.map((item) => (
                                        <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-3">
                                            <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                                <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm line-clamp-1">{item.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {item.selectedColor} • {item.selectedSize} • x{item.quantity}
                                                </p>
                                                <p className="text-sm text-pink-500">{formatPrice(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Separator />
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tạm tính</span>
                                        <span>{formatPrice(getTotalPrice())}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phí vận chuyển</span>
                                        <span className="text-green-600">Miễn phí</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span>Tổng cộng</span>
                                        <span className="text-pink-500">{formatPrice(getTotalPrice())}</span>
                                    </div>
                                </div>
                                <Button size="lg" className="w-full bg-pink-500 hover:bg-pink-600 text-white disabled:opacity-50" onClick={handleSubmit} disabled={isProcessing}>
                                    {isProcessing ? (
                                        <>
                                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Đặt Hàng'
                                    )}
                                </Button>
                                <p className="text-xs text-gray-500 text-center">
                                    {formData.paymentMethod === 'vnpay'
                                        ? 'Bạn sẽ được chuyển hướng đến trang thanh toán VNPay để hoàn tất thanh toán'
                                        : 'Bằng cách đặt hàng, bạn đồng ý với các điều khoản sử dụng của chúng tôi'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}