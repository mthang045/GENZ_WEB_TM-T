import { useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { ProductsProvider } from './contexts/ProductsContext'
import { CartProvider } from './contexts/CartContext'

import { Toaster } from './components/ui/sonner'
import Chatbot from './components/Chatbot'

import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { FeaturedProducts } from './components/FeaturedProducts'
import { Footer } from './components/Footer'
import { AllProducts } from './components/AllProducts'
import { ProductDetailPage } from './components/ProductDetailPage'
import { CartPage } from './components/CartPage'
import { Checkout } from './components/Checkout'
import { Login } from './components/Login'
import { Register } from './components/Register'
import { UserProfile } from './components/UserProfile'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleProductClick = (product) => {
    setSelectedProduct(product)
    setCurrentView('productDetail')
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    setCurrentView('allProducts')
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <Hero 
              onExplore={() => setCurrentView('allProducts')} 
              onViewCollection={() => setCurrentView('allProducts')}
            />
            <Features />
            <FeaturedProducts 
              onProductClick={handleProductClick}
              onViewAll={() => setCurrentView('allProducts')}
            />
          </>
        );
      case 'allProducts':
      case 'products':
        return (
          <AllProducts 
            onProductClick={handleProductClick}
            searchQuery={searchQuery}
          />
        );
      case 'productDetail':
        return (
          <ProductDetailPage 
            product={selectedProduct}
            onBack={() => setCurrentView('allProducts')}
            onProductClick={handleProductClick}
          />
        );
      case 'cart':
        return (
          <CartPage 
            onBack={() => setCurrentView('home')}
            onCheckout={() => setCurrentView('checkout')}
          />
        );
      case 'checkout':
        return (
          <Checkout 
            onBack={() => setCurrentView('cart')}
            onSuccess={() => setCurrentView('home')}
          />
        );
      case 'login':
        return (
          <Login 
            onBack={() => setCurrentView('home')}
            onSwitchToRegister={() => setCurrentView('register')}
            onLoginSuccess={() => setCurrentView('home')}
          />
        );
      case 'register':
        return (
          <Register 
            onBack={() => setCurrentView('home')}
            onSwitchToLogin={() => setCurrentView('login')}
            onRegisterSuccess={() => setCurrentView('home')}
          />
        );
      case 'profile':
        return (
          <UserProfile onBack={() => setCurrentView('home')} />
        );
      case 'about':
        return (
          <div className="container mx-auto py-16 px-4 text-center">
            <h2 className="text-3xl mb-4">Về chúng tôi</h2>
            <p className="text-lg text-gray-600">GENZ là thương hiệu mũ bảo hiểm hàng đầu cho thế hệ trẻ. An toàn, phong cách và chất lượng.</p>
          </div>
        );
      case 'contact':
        return (
          <div className="container mx-auto py-16 px-4 text-center">
            <h2 className="text-3xl mb-4">Liên hệ</h2>
            <p className="text-lg text-gray-600">Mọi thắc mắc vui lòng liên hệ: contact@genz.vn hoặc số điện thoại 0123 456 789.</p>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <div className="min-h-screen bg-white">
            <Header 
              onCartClick={() => setCurrentView('cart')}
              onLoginClick={() => setCurrentView('login')}
              onProfileClick={() => setCurrentView('profile')}
              onAdminClick={() => setCurrentView('admin')}
              onHomeClick={() => setCurrentView('home')}
              onSearch={handleSearch}
              onNavigate={setCurrentView}
            />
            
            <main>
              {renderContent()}
            </main>
            
            <Footer />
            <Chatbot />
            <Toaster />
          </div>
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  )
}

export default App

