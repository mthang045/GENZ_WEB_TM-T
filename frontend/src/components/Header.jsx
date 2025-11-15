import { useState } from 'react';
import { ShoppingCart, Menu, Search, X, User, LogIn, UserCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Sheet, SheetContent } from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/f78e3c35da8a6df43c6fe4dc2c4c28f2a6e85644.png';

export function Header({ onCartClick, onSearch, onNavigate, onLoginClick, onProfileClick, onAdminClick }) {
  const { getTotalItems } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoError, setLogoError] = useState(false);

  const handleSearch = () => {
    onSearch(searchQuery);
    onNavigate('products');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleNavClick = (section) => {
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-black text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Logo và Tên thương hiệu */}
            <button onClick={() => handleNavClick('home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
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
              <span className="text-xl font-bold hidden sm:block">GENZ</span>
            </button>

            {/* Thanh tìm kiếm (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Input
                  placeholder="Tìm kiếm mũ bảo hiểm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-10"
                />
                <Button size="sm" className="absolute right-1 top-1 h-8 w-8 bg-pink-500 hover:bg-pink-600" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Navigation (Desktop) */}
            <nav className="hidden lg:flex items-center space-x-6">
              <button onClick={() => handleNavClick('home')} className="hover:text-pink-400 transition-colors">Trang chủ</button>
              <button onClick={() => handleNavClick('products')} className="hover:text-pink-400 transition-colors">Sản phẩm</button>
              <button onClick={() => handleNavClick('about')} className="hover:text-pink-400 transition-colors">Về chúng tôi</button>
              <button onClick={() => handleNavClick('contact')} className="hover:text-pink-400 transition-colors">Liên hệ</button>
            </nav>

            {/* Icons (Giỏ hàng, User) */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white hover:text-pink-400 hover:bg-gray-800 relative" onClick={onCartClick}>
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-pink-500 text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
                <span className="ml-1 hidden sm:inline">Giỏ hàng</span>
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="hidden lg:flex items-center gap-1 px-3 py-2 rounded-md text-sm text-white hover:text-pink-400 hover:bg-gray-800 transition-colors">
                    <UserCircle className="h-5 w-5" />
                    <span className="hidden xl:inline">{user.name}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isAdmin() && (
                      <>
                        <DropdownMenuItem onClick={onAdminClick}>
                          <UserCircle className="mr-2 h-4 w-4" />
                          Quản trị Admin
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={onProfileClick}>
                      <User className="mr-2 h-4 w-4" />
                      Thông tin & Đơn hàng
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        logout();
                        handleNavClick('home');
                      }}
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" className="text-white hover:text-pink-400 hover:bg-gray-800 hidden lg:flex" onClick={onLoginClick}>
                  <LogIn className="h-5 w-5 mr-1" />
                  Đăng nhập
                </Button>
              )}

              {/* Nút Menu (Mobile) */}
              <Button variant="ghost" size="sm" className="lg:hidden text-white hover:text-pink-400 hover:bg-gray-800" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Thanh tìm kiếm (Mobile) */}
          <div className="md:hidden mt-3">
            <div className="relative w-full">
              <Input
                placeholder="Tìm kiếm mũ bảo hiểm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-10"
              />
              <Button size="sm" className="absolute right-1 top-1 h-8 w-8 bg-pink-500 hover:bg-pink-600" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Menu dạng Sheet (Mobile) */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="right" className="bg-black text-white border-gray-800">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                {!logoError ? (
                  <img
                    src={logo}
                    alt="GENZ Logo"
                    className="h-10 w-10 rounded-full object-cover"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="h-10 w-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">G</span>
                  </div>
                )}
                <span className="text-xl font-bold">GENZ</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-pink-400">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="flex flex-col space-y-4">
              <button onClick={() => handleNavClick('home')} className="text-left py-3 px-4 hover:bg-gray-800 rounded-lg transition-colors hover:text-pink-400">Trang chủ</button>
              <button onClick={() => handleNavClick('products')} className="text-left py-3 px-4 hover:bg-gray-800 rounded-lg transition-colors hover:text-pink-400">Sản phẩm</button>
              <button onClick={() => handleNavClick('about')} className="text-left py-3 px-4 hover:bg-gray-800 rounded-lg transition-colors hover:text-pink-400">Về chúng tôi</button>
              <button onClick={() => handleNavClick('contact')} className="text-left py-3 px-4 hover:bg-gray-800 rounded-lg transition-colors hover:text-pink-400">Liên hệ</button>
              
              {user ? (
                <>
                  <div className="border-t border-gray-800 pt-4">
                    <p className="px-4 py-2 text-sm text-gray-400">Xin chào, {user.name}</p>
                  </div>
                  {isAdmin() && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onAdminClick();
                      }}
                      className="text-left py-3 px-4 hover:bg-gray-800 rounded-lg transition-colors hover:text-pink-400"
                    >
                      Quản trị Admin
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onProfileClick();
                    }}
                    className="text-left py-3 px-4 hover:bg-gray-800 rounded-lg transition-colors hover:text-pink-400"
                  >
                    Thông tin & Đơn hàng
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      handleNavClick('home');
                    }}
                    className="text-left py-3 px-4 hover:bg-gray-800 rounded-lg transition-colors hover:text-pink-400"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLoginClick();
                  }}
                  className="text-left py-3 px-4 hover:bg-gray-800 rounded-lg transition-colors hover:text-pink-400"
                >
                  Đăng nhập
                </button>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}