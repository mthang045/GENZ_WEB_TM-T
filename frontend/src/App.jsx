import React from 'react';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { FeaturedProducts } from './components/FeaturedProducts';
import { AllProducts } from './components/AllProducts';
import { Footer } from './components/Footer';
import { CartPage } from './components/CartPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { Checkout } from './components/Checkout';
import { PaymentResult } from './components/PaymentResult';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { UserProfile } from './components/UserProfile';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProductsProvider } from './contexts/ProductsContext';
import { Toaster } from './components/ui/sonner';
function AppContent() {
    const { user, loading, isAdmin } = useAuth();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    // Helper: navigate and optionally reset search/scroll
    const navigateTo = (path, opts) => {
        var _a;
        if (opts === null || opts === void 0 ? void 0 : opts.resetSearch)
            setSearchQuery('');
        navigate(path);
        if ((_a = opts === null || opts === void 0 ? void 0 : opts.scrollTop) !== null && _a !== void 0 ? _a : true)
            window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleProductClick = (product) => {
        setSelectedProduct(product);
        navigateTo(`/product/${product.id}`);
    };
    const handleBackFromProductDetail = () => {
        setSelectedProduct(null);
        navigateTo('/products');
    };
    const handleCartClick = () => navigateTo('/cart');
    const handleCheckoutClick = () => navigateTo('/checkout');
    const handleNavigate = (section) => {
        if (section === 'home')
            return navigateTo('/', { resetSearch: true });
        if (section === 'products')
            return (navigate('/products'), setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100));
        if (section === 'cart')
            return navigateTo('/cart');
        if (section === 'about')
            return (navigate('/'), setTimeout(() => { var _a; return (_a = document.getElementById('features')) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' }); }, 100));
        if (section === 'contact')
            return (navigate('/'), setTimeout(() => { var _a; return (_a = document.getElementById('footer')) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' }); }, 100));
    };
    const handleSearch = (query) => {
        setSearchQuery(query);
        navigate('/products');
    };
    const handleViewAllProducts = () => {
        setSearchQuery('');
        navigateTo('/products');
    };
    const handleBackToHome = () => navigateTo('/', { resetSearch: true });
    const handleBackFromCheckout = () => navigateTo('/cart');
    const handleBackFromCart = () => navigateTo('/');
    const handleLoginClick = () => navigateTo('/login');
    const handleRegisterClick = () => navigateTo('/register');
    const handleProfileClick = () => {
        if (!user)
            return handleLoginClick();
        navigateTo('/profile');
    };
    const handleAdminClick = () => {
        if (!user || !isAdmin())
            return handleLoginClick();
        navigateTo('/admin');
    };
    const handleLoginSuccess = () => {
        if (user && isAdmin())
            navigateTo('/admin');
        else
            navigateTo('/');
    };
    const headerProps = {
        onCartClick: handleCartClick,
        onSearch: handleSearch,
        onNavigate: handleNavigate,
        onLoginClick: handleLoginClick,
        onProfileClick: handleProfileClick,
        onAdminClick: handleAdminClick,
    };
    const PageLayout = ({ children }) => (
    <div className="min-h-screen">
      <Header {...headerProps} />
      {children}
      <div id="footer">
        <Footer />
      </div>
      <Toaster position="top-right" />
    </div>
  )

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PageLayout>
            <Hero onExplore={handleViewAllProducts} onViewCollection={handleViewAllProducts} />
            <div id="features">
              <Features />
            </div>
            <FeaturedProducts onProductClick={handleProductClick} onViewAll={handleViewAllProducts} />
          </PageLayout>
        }
      />
      <Route
        path="/products"
        element={
          <PageLayout>
            <AllProducts onProductClick={handleProductClick} searchQuery={searchQuery} />
          </PageLayout>
        }
      />
      <Route
        path="/product/:id"
        element={
          <PageLayout>
            <ProductDetailPage product={selectedProduct} onBack={handleBackFromProductDetail} onProductClick={handleProductClick} />
          </PageLayout>
        }
      />
      <Route path="/cart" element={
        <CartPage 
          onBack={handleBackFromCart}
          onCheckout={handleCheckoutClick}
        />
      } />
      <Route path="/checkout" element={
        <Checkout 
          onBack={handleBackFromCheckout}
          onSuccess={handleBackToHome}
        />
      } />
      <Route path="/checkout/success" element={
        <PageLayout>
          <PaymentResult />
        </PageLayout>
      } />
      <Route path="/login" element={
        <Login 
          onBack={handleBackToHome}
          onSwitchToRegister={handleRegisterClick}
          onLoginSuccess={handleLoginSuccess}
        />
      } />
      <Route path="/register" element={
        <Register 
          onBack={handleBackToHome}
          onSwitchToLogin={handleLoginClick}
          onRegisterSuccess={handleLoginSuccess}
        />
      } />
      <Route path="/profile" element={
        <UserProfile onBack={handleBackToHome} />
      } />
      <Route path="/admin" element={
        loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p>Đang tải...</p>
            </div>
          </div>
        ) : user && isAdmin() ? (
          <div className="min-h-screen">
            <AdminDashboard onLogout={handleBackToHome} />
            <Toaster position="top-right" />
          </div>
        ) : (
          <Navigate to="/login" />
        )
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  )
}
