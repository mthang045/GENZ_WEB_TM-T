import { useState } from 'react';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
const logo = 'https://placehold.co/64x64/E91E63/FFFFFF?text=G&font=poppins'; // Placeholder logo

export function Register({ onBack, onSwitchToLogin, onRegisterSuccess }) {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return;
        }
        setLoading(true);
        const ok = await register(formData.email, formData.password, formData.name);
        setLoading(false);
        if (ok)
            onRegisterSuccess();
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <Button variant="ghost" onClick={onBack} className="mb-6 text-white hover:text-pink-400">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay Lại
                </Button>
                <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
                    <CardHeader className="text-center space-y-4">
                        <img src={logo} alt="GENZ Logo" className="h-16 w-16 mx-auto rounded-full object-cover" />
                        <CardTitle className="text-2xl text-white">Đăng Ký</CardTitle>
                        <CardDescription className="text-gray-400">Tạo tài khoản GENZ mới</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-white">Họ và tên</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Nguyễn Văn A"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
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
                                        onChange={handleInputChange}
                                        className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-white">Xác nhận mật khẩu</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                                        required
                                    />
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
                                <button onClick={onSwitchToLogin} className="text-pink-400 hover:text-pink-300 underline">
                                    Đăng nhập
                                </button>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}