import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { requestPasswordReset, resetPassword } = useAuth();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await requestPasswordReset(email);
      setMessage('Mã xác nhận đã gửi về email!');
      setStep(2);
    } catch (err) {
      setMessage(err?.error || 'Gửi mã thất bại');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await resetPassword(email, code, newPassword);
      setMessage('Đổi mật khẩu thành công!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMessage(err?.error || 'Đổi mật khẩu thất bại');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Quên mật khẩu</h2>
        {step === 1 && (
          <form onSubmit={handleSendCode}>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
              value={email}
              disabled
            />
            <label className="block text-gray-300 mb-2">Mã xác nhận</label>
            <input
              type="text"
              className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
            />
            <label className="block text-gray-300 mb-2">Mật khẩu mới</label>
            <input
              type="password"
              className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600" disabled={loading}>
              {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </form>
        )}
        {message && <div className="mt-4 text-center text-pink-400">{message}</div>}
        <button className="mt-6 text-gray-400 hover:underline w-full" onClick={() => navigate('/login')}>Quay lại đăng nhập</button>
      </div>
    </div>
  );
}
