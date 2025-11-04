import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { CheckCircle2, XCircle, Loader } from 'lucide-react'
import { apiFetch } from '../lib/api'
import { useCart } from '../contexts/CartContext'
import { toast } from 'sonner'

export function PaymentResult() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'loading'>('loading')

  const status = searchParams.get('status')
  const txnRef = searchParams.get('txnRef')
  const transactionNo = searchParams.get('transactionNo')

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        if (!txnRef) {
          setPaymentStatus('failed')
          setLoading(false)
          return
        }

        // Optional: Fetch payment details from backend
        try {
          const response = await apiFetch(`api/vnpay/status/${txnRef}`)
          if (response.success && response.data.status === 'completed') {
            setPaymentStatus('success')
            clearCart()
            toast.success('Thanh toán thành công!')
          } else {
            setPaymentStatus('failed')
            toast.error('Thanh toán thất bại')
          }
        } catch (err) {
          // If API call fails, use URL status as fallback
          if (status === 'completed') {
            setPaymentStatus('success')
            clearCart()
            toast.success('Thanh toán thành công!')
          } else {
            setPaymentStatus('failed')
            toast.error('Thanh toán thất bại')
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
        setPaymentStatus('failed')
      } finally {
        setLoading(false)
      }
    }

    checkPaymentStatus()
  }, [txnRef, status, clearCart])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto text-center">
          <CardContent className="pt-12 pb-12">
            {paymentStatus === 'success' ? (
              <>
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl mb-4 font-bold text-green-600">Thanh Toán Thành Công!</h2>
                <p className="text-gray-600 mb-6">
                  Cảm ơn bạn đã mua hàng tại GENZ Helmets.
                </p>

                <div className="mt-8 p-4 bg-green-50 rounded-lg text-left max-w-md mx-auto space-y-3">
                  <h4 className="font-semibold text-green-800 mb-3">Chi tiết giao dịch:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã đơn hàng:</span>
                      <span className="font-mono">{txnRef}</span>
                    </div>
                    {transactionNo && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã giao dịch VNPay:</span>
                        <span className="font-mono">{transactionNo}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian:</span>
                      <span>{new Date().toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-left max-w-md mx-auto">
                  <h4 className="font-semibold mb-3">Tiếp theo:</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>✓ Bạn sẽ nhận được email xác nhận đơn hàng</li>
                    <li>✓ Kiểm tra trạng thái đơn hàng trong trang cá nhân</li>
                    <li>✓ Chúng tôi sẽ liên hệ để xác nhận giao hàng</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                <h2 className="text-3xl mb-4 font-bold text-red-600">Thanh Toán Thất Bại</h2>
                <p className="text-gray-600 mb-6">
                  Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
                </p>

                {txnRef && (
                  <div className="mt-8 p-4 bg-red-50 rounded-lg text-left max-w-md mx-auto">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã đơn hàng:</span>
                        <span className="font-mono">{txnRef}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trạng thái:</span>
                        <span className="text-red-600">Thất bại</span>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-600 mt-6">
                  Vui lòng quay lại giỏ hàng và thử lại, hoặc chọn phương thức thanh toán khác.
                </p>
              </>
            )}

            <div className="flex gap-4 justify-center mt-8">
              <Button
                onClick={() => navigate('/profile')}
                className="bg-pink-500 hover:bg-pink-600"
              >
                Xem Đơn Hàng
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
              >
                Về Trang Chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
