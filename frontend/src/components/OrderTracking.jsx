import { useState } from 'react';
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import React from 'react';

export function OrderTracking({ orders, userEmail }) {
    const [expandedOrder, setExpandedOrder] = useState(null);

    // Filter orders for current user
    const userOrders = orders
        .filter(order => order.customerInfo.email === userEmail)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatDate = (dateString) => {
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return {
                    label: 'Chờ Xác Nhận',
                    color: 'bg-yellow-500',
                    icon: Clock,
                    textColor: 'text-yellow-700',
                    bgColor: 'bg-yellow-50'
                };
            case 'confirmed':
                return {
                    label: 'Đã Xác Nhận',
                    color: 'bg-blue-500',
                    icon: CheckCircle,
                    textColor: 'text-blue-700',
                    bgColor: 'bg-blue-50'
                };
            case 'shipping':
                return {
                    label: 'Đang Giao Hàng',
                    color: 'bg-purple-500',
                    icon: Truck,
                    textColor: 'text-purple-700',
                    bgColor: 'bg-purple-50'
                };
            case 'delivered':
                return {
                    label: 'Đã Giao Hàng',
                    color: 'bg-green-500',
                    icon: CheckCircle,
                    textColor: 'text-green-700',
                    bgColor: 'bg-green-50'
                };
            case 'cancelled':
                return {
                    label: 'Đã Hủy',
                    color: 'bg-red-500',
                    icon: XCircle,
                    textColor: 'text-red-700',
                    bgColor: 'bg-red-50'
                };
            default: // Thêm default case để tránh lỗi
                return {
                    label: 'Không xác định',
                    color: 'bg-gray-500',
                    icon: XCircle,
                    textColor: 'text-gray-700',
                    bgColor: 'bg-gray-50'
                };
        }
    };

    const toggleOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    if (userOrders.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Đơn Hàng Của Tôi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 mb-2">Bạn chưa có đơn hàng nào</p>
                        <p className="text-sm text-gray-400">Hãy khám phá và đặt hàng ngay!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl mb-4">
                Đơn Hàng Của Tôi ({userOrders.length})
            </h2>
            {userOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                const isExpanded = expandedOrder === order._id;
                return (
                    <Card key={order._id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-lg">
                                            Đơn hàng #{order.orderId}
                                        </CardTitle>
                                        <Badge className={statusInfo.color}>
                                            <StatusIcon className="w-3 h-3 mr-1" />
                                            {statusInfo.label}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Đặt ngày: {formatDate(order.createdAt)}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => toggleOrder(order._id)}>
                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="mb-4">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-gray-600">
                                        {order.items.length} sản phẩm
                                    </span>
                                    <span className="text-pink-500">{formatPrice(order.totalAmount)}</span>
                                </div>
                                {!isExpanded && order.items.length > 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                        {order.items.slice(0, 3).map((item, idx) => (
                                            <div key={idx} className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center text-gray-400 text-xs">
                                                Ảnh
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600">
                                                +{order.items.length - 3}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {isExpanded && (
                                <>
                                    <Separator className="mb-4" />
                                    <div className="space-y-3 mb-4">
                                        <h4 className="text-sm">Sản phẩm:</h4>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex gap-3">
                                                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Ảnh</div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm truncate">{item.productName}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {item.color} • {item.size} • x{item.quantity}
                                                    </p>
                                                    <p className="text-sm text-pink-500">{formatPrice(item.price * item.quantity)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Separator className="mb-4" />
                                    <div className="space-y-2 mb-4">
                                        <h4 className="text-sm">Thông tin khách hàng:</h4>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>
                                                <span className="font-medium">Người nhận:</span> {order.customerInfo.name}
                                            </p>
                                            <p>
                                                <span className="font-medium">Điện thoại:</span> {order.customerInfo.phone}
                                            </p>
                                            <p>
                                                <span className="font-medium">Email:</span> {order.customerInfo.email}
                                            </p>
                                            <p>
                                                <span className="font-medium">Địa chỉ:</span> {order.customerInfo.address}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}