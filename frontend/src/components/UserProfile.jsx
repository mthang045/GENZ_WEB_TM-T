import { ArrowLeft, Package, User, Mail, Calendar } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { useAuth } from '../contexts/AuthContext'



export function UserProfile({ onBack }) {
  const { user, getUserOrders, logout } = useAuth()

  if (!user) return null

  const userOrders = getUserOrders()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'confirmed': return 'bg-blue-500'
      case 'shipping': return 'bg-purple-500'
      case 'delivered': return 'bg-green-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ch? x�c nh?n'
      case 'confirmed': return '�� x�c nh?n'
      case 'shipping': return '�ang giao'
      case 'delivered': return '�� giao'
      case 'cancelled': return '�� h?y'
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
          Quay L?i
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Th�ng Tin T�i Kho?n
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-gray-500">H? t�n</p>
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
                      <p className="text-gray-500">Ng�y tham gia</p>
                      <p>{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">T?ng don h�ng</span>
                    <span>{userOrders.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">�� ho�n th�nh</span>
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
                  �ang Xu?t
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
                  �on H�ng C?a T�i ({userOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">B?n chua c� don h�ng n�o</p>
                    <Button onClick={onBack} className="mt-4 bg-pink-500 hover:bg-pink-600">
                      Mua S?m Ngay
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((order) => (
                        <div key={order._id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-500">M� don h�ng</p>
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
                            <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">T?ng c?ng</p>
                              <p className="text-pink-500">{formatPrice(order.totalAmount)}</p>
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

