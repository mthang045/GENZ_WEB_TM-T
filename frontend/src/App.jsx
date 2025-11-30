import React from 'react';
// This file is the main application component
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProductsProvider, useProducts } from './contexts/ProductsContext';
import { CartProvider } from './contexts/CartContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { FeaturedProducts } from './components/FeaturedProducts';
import { AllProducts } from './components/AllProducts';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartPage } from './components/CartPage';
import { Checkout } from './components/Checkout';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { UserProfile } from './components/UserProfile';
import { Footer } from './components/Footer';
import Chatbot from './components/Chatbot';
import { Toaster } from './components/ui/sonner';
import { AdminDashboard } from './components/admin/AdminDashboard';

// --- Components Phụ ---

function ProductDetailWrapper() {
  const { id } = useParams();
  const { products } = useProducts();
  const product = products ? products.find(p => String(p.id || p._id) === id) : null;
  const navigate = useNavigate();
  
  if (!product) return null; 
  
  return <ProductDetailPage product={product} onBack={() => navigate('/products')} onProductClick={(p) => navigate(`/product/${p.id || p._id}`)} />;
}

// --- Component Chính: App ---

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header
              onCartClick={() => navigate('/cart')}
              onSearch={(q) => { setSearchQuery(q); navigate('/products'); }}
              onLoginClick={() => navigate('/login')}
              onProfileClick={() => navigate('/profile')}
              onAdminClick={() => window.location.href = '/admin'}
              onNavigate={(section) => {
                if (section === 'home') navigate('/');
                else if (section === 'products') navigate('/products');
                else if (section === 'about') window.scrollTo({ top: 1000, behavior: 'smooth' });
                else if (section === 'contact') window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }}
            />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={
                  <>
                    <Hero onExplore={() => navigate('/products')} onViewCollection={() => navigate('/products')} />
                    <Features />
                    <FeaturedProducts onProductClick={(p) => navigate(`/product/${p.id || p._id}`)} onViewAll={() => navigate('/products')} />
                  </>
                } />
                <Route path="/products" element={<AllProducts onProductClick={(p) => navigate(`/product/${p.id || p._id}`)} searchQuery={searchQuery} />} />
                <Route path="/product/:id" element={<ProductDetailWrapper />} />
                <Route path="/cart" element={<CartPage onBack={() => navigate('/')} onCheckout={() => navigate('/checkout')} />} />
                <Route path="/checkout" element={<Checkout onBack={() => navigate('/cart')} onSuccess={() => navigate('/')} />} />
                <Route path="/login" element={<Login onBack={() => navigate('/')} onLoginSuccess={() => navigate('/')} />} />
                <Route path="/register" element={<Register onBack={() => navigate('/login')} />} />
                <Route path="/profile" element={<UserProfile onBack={() => navigate('/')} />} />
                <Route path="/admin" element={<AdminDashboard onLogout={() => navigate('/login')} />} />
                <Route path="/forgot-password" element={React.createElement(require('./components/ForgotPassword.jsx').default)} />
              </Routes>
            </main>
            {!isAdminPage && <Footer />}
            <Chatbot />
            <Toaster />
          </div>
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}

// --- Component Router (Bọc ngoài cùng) ---

function AppWithRouter() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWithRouter;