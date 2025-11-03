import { ArrowLeft, Package, User as UserIcon, Mail, Calendar } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { useAuth } from '../contexts/AuthContext'

interface UserProfileProps {
  onBack: () => void
}

export function UserProfile({ onBack }: UserProfileProps) {
  const { user, getUserOrders, logout } = useAuth()

  if (!user) return null

  const userOrders = getUserOrders()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'confirmed': return 'bg-blue-500'
      case 'shipping': return 'bg-purple-500'
      case 'delivered': return 'bg-green-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận'
      case 'confirmed': return 'Đã xác nhận'
      case 'shipping': return 'Đang giao'
      case 'delivered': return 'Đã giao'
      case 'cancelled': return 'Đã hủy'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 hover:text-pink-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay Lại
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Thông Tin Tài Khoản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-gray-500">Họ tên</p>
                      <p>{user.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p>{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-gray-500">Ngày tham gia</p>
                      <p>{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tổng đơn hàng</span>
                    <span>{userOrders.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Đã hoàn thành</span>
                    <span className="text-green-600">
                      {userOrders.filter(o => o.status === 'delivered').length}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    logout()
                    onBack()
                  }}
                >
                  Đăng Xuất
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Orders List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Đơn Hàng Của Tôi ({userOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
                    <Button onClick={onBack} className="mt-4 bg-pink-500 hover:bg-pink-600">
                      Mua Sắm Ngay
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order) => (
                      <div key={order._id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-500">Mã đơn hàng</p>
                            <p>{order.orderId}</p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {item.productName} x{item.quantity}
                              </span>
                              <span>{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Tổng cộng</p>
                            <p className="text-pink-500">
                              {formatPrice(order.totalAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
