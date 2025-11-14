import { useState } from 'react';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import logo from '../assets/f78e3c35da8a6df43c6fe4dc2c4c28f2a6e85644.png';
import React from 'react';

export function Footer() {
  const [logoError, setLogoError] = useState(false);

  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Cột 1: Logo và Mô tả */}
          <div className="space-y-6">
            {!logoError ? (
              <img
                src={logo}
                alt="GENZ Logo"
                className="h-12 w-12 rounded-full object-cover"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="h-12 w-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
            )}
            <p className="text-gray-400 leading-relaxed">
              GENZ - Thương hiệu mũ bảo hiểm hàng đầu cho thế hệ trẻ. An toàn,
              phong cách và chất lượng.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-pink-400 hover:bg-gray-800 p-2">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-pink-400 hover:bg-gray-800 p-2">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-pink-400 hover:bg-gray-800 p-2">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Cột 2: Liên Kết Nhanh */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Liên Kết Nhanh</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Trang chủ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Sản phẩm</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Thương hiệu</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Về chúng tôi</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Liên hệ</a></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ Trợ Khách Hàng */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Hỗ Trợ Khách Hàng</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Hướng dẫn mua hàng</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Chính sách đổi trả</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Bảo hành</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Giao hàng</a></li>
            </ul>
          </div>

          {/* Cột 4: Liên Hệ */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Liên Hệ</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-pink-400 flex-shrink-0 mt-1" />
                <p className="text-gray-400">123 Đường ABC, Quận XYZ, TP.HCM</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-pink-400 flex-shrink-0" />
                <p className="text-gray-400">0123 456 789</p>

              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-pink-400 flex-shrink-0" />
                <p className="text-gray-400">contact@genz.vn</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8">
          <div className="text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} GENZ. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}