import { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { useAuth } from '../../contexts/AuthContext';
import { orders as apiOrders } from '../../lib/api';

export function AdminOrders() {
  const { updateOrderStatus } = useAuth();
  const [ordersList, setOrdersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'shipping': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const filteredOrders = ordersList
    .filter((order) => order && typeof order === 'object')
    .filter(order => {
      const orderId = order?.orderId ? String(order.orderId) : '';
      const customerName = order?.customerInfo?.name ? String(order.customerInfo.name) : '';
      const customerEmail = order?.customerInfo?.email ? String(order.customerInfo.email) : '';
      const matchesSearch = orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await apiOrders.updateStatus(orderId, newStatus);
      const updated = (res && typeof res === 'object' && (res.data || res)) ? (res.data || res) : null;
      const updatedId = updated?._id || updated?.id || updated?.orderId || orderId;
      const updatedStatus = updated?.status || newStatus;
      setOrdersList(prev => (Array.isArray(prev) ? prev : [])
        .filter((o) => o && typeof o === 'object')
        .map(o => ((o._id || o.id || o.orderId) === updatedId ? { ...o, status: updatedStatus } : o))
      );
      if ((selectedOrder?._id || selectedOrder?.id || selectedOrder?.orderId) === updatedId) {
        setSelectedOrder({ ...selectedOrder, status: updatedStatus });
      }
      updateOrderStatus(updatedId, updatedStatus);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  useEffect(() => {
    let mounted = true;
    apiOrders.list()
      .then((res) => {
        if (!mounted) return;
        const raw = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        const normalized = raw
          .filter((o) => o && typeof o === 'object')
          .map((o) => ({ ...o, _id: o._id || o.id || o.orderId }));
        setOrdersList(normalized);
      })
      .catch(err => console.error('Failed to load orders', err));
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Quản Lý Đơn Hàng</h2>
        <p className="text-gray-500">Tổng: {ordersList.length} đơn hàng</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo mã đơn, tên, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Chờ xác nhận</SelectItem>
            <SelectItem value="confirmed">Đã xác nhận</SelectItem>
            <SelectItem value="shipping">Đang giao</SelectItem>
            <SelectItem value="delivered">Đã giao</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-12">Không tìm thấy đơn hàng</p>
          ) : (
            <div className="divide-y">
              {filteredOrders.map((order, idx) => {
                if (!order || typeof order !== 'object') return null;
                const key = String(order._id || order.id || order.orderId || idx);
                return (
                  <div key={key} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p>#{order.orderId || key}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{order.customerInfo?.name || '—'}</p>
                        <p className="text-sm text-gray-500">{order.customerInfo?.email || '—'}</p>
                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Tổng tiền</p>
                          <p className="text-pink-500">{formatPrice(order.totalAmount || 0)}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleViewOrder(order)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Xem
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Chi Tiết Đơn Hàng #{selectedOrder.orderId}</DialogTitle>
                <DialogDescription>
                  Đặt hàng lúc {formatDate(selectedOrder.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block">Trạng thái đơn hàng</Label>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => handleStatusChange(selectedOrder._id || selectedOrder.id || selectedOrder.orderId, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Chờ xác nhận</SelectItem>
                      <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                      <SelectItem value="shipping">Đang giao</SelectItem>
                      <SelectItem value="delivered">Đã giao</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div>
                  <h4 className="mb-3">Thông tin khách hàng</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tên:</span>
                      <span>{selectedOrder.customerInfo?.name || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{selectedOrder.customerInfo?.email || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SĐT:</span>
                      <span>{selectedOrder.customerInfo?.phone || '—'}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Địa chỉ:</span>
                      <span className="text-right max-w-xs">{selectedOrder.customerInfo?.address || '—'}</span>
                    </div>
                    {selectedOrder.notes && (
                       <div className="flex justify-between items-start">
                        <span className="text-gray-600">Ghi chú:</span>
                        <span className="text-right max-w-xs">{selectedOrder.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="mb-3">Sản phẩm</h4>
                  <div className="space-y-3">
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm p-3 bg-gray-50 rounded">
                        <div>
                          <p>{item.productName}</p>
                          <p className="text-gray-500">
                            {item.color} • {item.size} • x{item.quantity}
                          </p>
                        </div>
                        <p className="text-pink-500">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phương thức:</span>
                    <span>{selectedOrder.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tổng cộng</span>
                    <span className="text-pink-500">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}