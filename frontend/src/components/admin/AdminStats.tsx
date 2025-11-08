import { TrendingUp, Package, ShoppingBag, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useAuth } from '../../contexts/AuthContext'
import { useProducts } from '../../contexts/ProductsContext'
import { useEffect, useState } from 'react'
import { orders as apiOrders } from '../../lib/api'
import { Order } from '../../lib/auth-types'

export function AdminStats() {
  const { user } = useAuth()
  const { products } = useProducts()
  const [orders, setOrders] = useState<Order[]>([])

  // Load orders from API when admin loads
  useEffect(() => {
    let mounted = true
    if (user?.role === 'admin') {
      apiOrders.list().then((res) => {
        if (!mounted) return
        const data = res.data || []
        setOrders(data)
      }).catch(err => console.error('Failed to load orders', err))
    }
    return () => { mounted = false }
  }, [user])

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const totalOrders = orders.length
  const totalProducts = products.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const stats = [
    {
      title: 'Tổng Doanh Thu',
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Đơn Hàng',
      value: totalOrders.toString(),
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Sản Phẩm',
      value: totalProducts.toString(),
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Chờ Xử Lý',
      value: pendingOrders.toString(),
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ]

  // Recent orders
  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

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
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Đơn Hàng Gần Đây</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Chưa có đơn hàng nào</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p>#{order.orderId}</p>
                    <p className="text-sm text-gray-500">{order.customerInfo.name}</p>
                  </div>
                  <div className="text-right mr-4">
                    <p>{formatPrice(order.totalAmount)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className={`${getStatusColor(order.status)} text-white px-3 py-1 rounded-full text-xs`}>
                    {getStatusText(order.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Sản Phẩm Bán Chạy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.slice(0, 5).map((product) => {
              const soldCount = orders.reduce((total, order) => {
                const orderItem = order.items.find(item => item.productId === product.id)
                return total + (orderItem?.quantity || 0)
              }, 0)

              return (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div>
                      <p>{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p>{formatPrice(product.price)}</p>
                    <p className="text-sm text-gray-500">Đã bán: {soldCount}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
