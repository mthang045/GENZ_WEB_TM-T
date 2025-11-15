import { Star, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ProductCard({ product, onQuickView }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    return (
        <Card
            className={`group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-gray-200 h-full flex flex-col ${!product.inStock ? 'opacity-60 pointer-events-none' : ''}`}
            onClick={() => onQuickView(product)}
        >
            <div className="relative overflow-hidden aspect-square bg-gray-100">
                <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {!product.inStock && (
                    <Badge className="absolute top-3 right-3 bg-red-500">Hết hàng</Badge>
                )}
                <Badge className="absolute top-3 left-3 bg-pink-500">{product.category}</Badge>
                
                {/* Overlay cho Desktop */}
                <div className="absolute inset-0 bg-black/60 opacity-0 md:group-hover:opacity-100 transition-all duration-300 items-center justify-center pointer-events-none md:group-hover:pointer-events-auto hidden md:flex">
                    <Button
                        onClick={(e) => {
                            e.stopPropagation(); // Ngăn card bị click khi bấm nút này
                            onQuickView(product);
                        }}
                        className="bg-white text-black hover:bg-pink-500 hover:text-white transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                    >
                        Xem Chi Tiết
                    </Button>
                </div>
            </div>
            
            <div className="p-4 space-y-3 flex-1 flex flex-col">
                <div className="space-y-1 flex-1">
                    <h3 className="line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                        </div>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{product.brand}</span>
                    </div>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between pt-2">
                    <div>
                        <p className="text-pink-500">{formatPrice(product.price)}</p>
                    </div>
                    {/* Nút Mua cho Mobile (hiện trên md:hidden) */}
                    <Button
                        size="sm"
                        className="bg-black hover:bg-pink-500 text-white md:hidden"
                        onClick={(e) => {
                            e.stopPropagation();
                            onQuickView(product);
                        }}
                        disabled={!product.inStock}
                    >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Mua
                    </Button>
                </div>
            </div>
        </Card>
    );
}