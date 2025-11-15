import { useState } from 'react';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/f78e3c35da8a6df43c6fe4dc2c4c28f2a6e85644.png';

export function Login({ onBack, onSwitchToRegister, onLoginSuccess }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(formData.email, formData.password);
    setLoading(false);
    if (ok)
      onLoginSuccess();
  };

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
            <img
              src={logo}
              alt="GENZ Logo"
              className="h-16 w-16 mx-auto rounded-full object-cover"
            />
            <CardTitle className="text-2xl text-white">Đăng Nhập</CardTitle>
            <CardDescription className="text-gray-400">
              Đăng nhập vào tài khoản GENZ của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    required
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-gray-400 text-sm">
                Chưa có tài khoản?{' '}
                <button
                  onClick={onSwitchToRegister}
                  className="text-pink-400 hover:text-pink-300 underline"
                >
                  Đăng ký ngay
                </button>
              </p>
              
              <div className="pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-500">
                  Tài khoản demo Admin:
                  <br />
                  Email: admin@genz.vn
                  <br />
                  Password: admin123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}