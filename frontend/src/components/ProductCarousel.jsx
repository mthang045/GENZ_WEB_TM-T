import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { ProductCard } from './ProductCard';
import React from 'react';

export function ProductCarousel({ products, onProductClick }) {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400; // Độ dài cuộn
            const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative group">
            {/* Nút cuộn trái */}
            <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 h-12 w-12 rounded-full"
                onClick={() => scroll('left')}
            >
                <ChevronLeft className="w-6 h-6" />
            </Button>
            
            {/* Vùng cuộn chứa sản phẩm */}
            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-2 py-4 snap-x snap-mandatory"
            >
                {products.map((product) => (
                    <div key={product.id} className="flex-shrink-0 w-[280px] sm:w-[300px] snap-start snap-always">
                        <ProductCard product={product} onQuickView={onProductClick} />
                    </div>
                ))}
            </div>

            {/* Nút cuộn phải */}
            <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 h-12 w-12 rounded-full"
                onClick={() => scroll('right')}
            >
                <ChevronRight className="w-6 h-6" />
            </Button>
        </div>
    );
}