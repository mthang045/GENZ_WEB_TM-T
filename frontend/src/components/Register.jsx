import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, User } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/f78e3c35da8a6df43c6fe4dc2c4c28f2a6e85644.png'



export function Register({ onBack, onSwitchToLogin, onRegisterSuccess }) {
  const { register } = useAuth()
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      return
    }
    setLoading(true)
    const ok = await register(formData.email, formData.password, formData.name)
    setLoading(false)
    if (ok && typeof onRegisterSuccess === 'function') onRegisterSuccess()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-white hover:text-pink-400"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay Lại
        </Button>

        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardHeader className="text-center space-y-4">
            <img src={logo} alt="GENZ Logo" className="h-16 w-16 mx-auto rounded-full object-cover" />
            <CardTitle className="text-2xl text-white">Đăng Ký</CardTitle>
            <CardDescription className="text-gray-400">
              Tạo tài khoản GENZ mới
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Họ và tên</Label>
                <div className="relative w-full">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500 w-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="relative w-full">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500 w-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Mật khẩu</Label>
                <div className="relative w-full">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mật khẩu"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500 w-full"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-400"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Xác nhận mật khẩu</Label>
                <div className="relative w-full">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Xác nhận mật khẩu"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500 w-full"
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-400"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-red-500">Mật khẩu không khớp</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                size="lg"
                disabled={formData.password !== formData.confirmPassword || loading}
              >
                {loading ? 'Đang xử lý...' : 'Đăng Ký'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-pink-400 hover:text-pink-300 underline"
                >
                  Đăng nhập
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
