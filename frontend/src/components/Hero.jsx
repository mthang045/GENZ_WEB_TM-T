import React, { useState, useEffect } from 'react'; // Đã import React ở đây
import { Button } from './ui/button'
import { ImageWithFallback } from './figma/ImageWithFallback'
// Xóa 'interface HeroProps'

function HeroCarousel() {
  const images = [
    {
      src: "https://images.unsplash.com/photo-1704977733553-e3d7d92c4d66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwaGVsbWV0JTIwc2FmZXR5fGVufDF8fHx8MTc1OTg0OTUxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Mũ bảo hiểm an toàn"
    },
    {
      src: "https://images.unsplash.com/photo-1631997673188-c0c07702bd25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1vdG9yY3ljbGUlMjBoZWxtZXR8ZW58MXx8fHwxNzU5ODQ5NTEwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Mũ bảo hiểm đen"
    },
    {
      src: "https://images.unsplash.com/photo-1626275850959-2f19cd600b0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydCUyMG1vdG9yY3ljbGUlMjBoZWxtZXQlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NTk4NDk3NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Mũ bảo hiểm thể thao"
    },
    {
      src: "https://images.unsplash.com/photo-1606231699039-3f4211407475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiaWtlJTIwaGVsbWV0JTIwZGVzaWdufGVufDF8fHx8MTc1OTg0OTc3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Mũ bảo hiểm hiện đại"
    }
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 3000) // Chuyển ảnh mỗi 3 giây

    return () => clearInterval(interval)
  }, [images.length])

  return (
    <div className="relative overflow-hidden">
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <ImageWithFallback
              src={image.src}
              alt={image.alt}
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        ))}
      </div>
      
      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-pink-500' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Đã xóa type annotation ': HeroProps'
export function Hero({ onExplore, onViewCollection }) {
  return (
    <section className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold">
                Mũ Bảo Hiểm 
                <span className="text-pink-400 block">GENZ</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Bảo vệ an toàn với phong cách hiện đại. Chúng tôi cung cấp những chiếc mũ bảo hiểm chất lượng cao cho thế hệ GenZ năng động.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4"
                onClick={onExplore}
              >
                Khám Phá Ngay
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-black px-8 py-4"
                onClick={onViewCollection}
              >
                Xem Bộ Sưu Tập
              </Button>
            </div>

            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400">500+</div>
                <div className="text-gray-400">Sản phẩm</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400">10k+</div>
                <div className="text-gray-400">Khách hàng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400">5★</div>
                <div className="text-gray-400">Đánh giá</div>
              </div>
            </div>
          </div>

          {/* Right content - Hero image */}
          <div className="relative">
            <div className="relative z-10">
              <HeroCarousel />
            </div>
            {/* Background decoration */}
            <div className="absolute -top-4 -right-4 w-full h-full bg-pink-500 rounded-2xl opacity-20 z-0"></div>
            <div className="absolute -bottom-4 -left-4 w-full h-full bg-gray-700 rounded-2xl opacity-30 z-0"></div>
          </div>
        </div>
      </div>
    </section>
  )
}