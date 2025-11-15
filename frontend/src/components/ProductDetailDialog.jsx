import { useState } from 'react';
import { Star, ShoppingCart, Check, Minus, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useCart } from '../contexts/CartContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ProductDetailDialog({ product, open, onClose }) {
    const { addToCart } = useCart();
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);

    if (!product)
        return null;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Get available quantity for selected variant
    const getAvailableQuantity = (color, size) => {
        if (!product.inventory || product.inventory.length === 0)
            return 999; // No inventory tracking
        const variant = product.inventory.find(inv => inv.color === color && inv.size === size);
        return variant?.quantity || 0;
    };

    const availableQuantity = selectedColor && selectedSize
        ? getAvailableQuantity(selectedColor, selectedSize)
        : 999;

    const handleAddToCart = () => {
        if (!selectedColor || !selectedSize) {
            return;
        }
        if (availableQuantity === 0) {
            return;
        }
        addToCart(product, selectedColor, selectedSize, quantity);
        onClose();
        // Reset selections
        setSelectedColor('');
        setSelectedSize('');
        setQuantity(1);
    };

    const handleOpenChange = (isOpen) => {
        if (!isOpen) {
            onClose();
            // Reset selections when dialog closes
            setSelectedColor('');
            setSelectedSize('');
            setQuantity(1);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{product.name}</DialogTitle>
                    <DialogDescription>
                        Chi tiết sản phẩm, chọn màu sắc và kích cỡ để thêm vào giỏ hàng
                    </DialogDescription>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            {!product.inStock && (
                                <Badge className="absolute top-3 right-3 bg-red-500">Hết hàng</Badge>
                            )}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-pink-500">{product.category}</Badge>
                                <Badge variant="outline">{product.brand}</Badge>
                            </div>
                            <div className="text-3xl text-pink-500">{formatPrice(product.price)}</div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.floor(product.rating)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600">({product.rating} sao)</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-600">{product.description}</p>
                        </div>
                        <div>
                            <h4 className="mb-3">Tính năng nổi bật:</h4>
                            <ul className="space-y-2">
                                {product.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-2">Màu sắc:</h4>
                            <div className="flex flex-wrap gap-2">
                                {product.colors.map((color) => (
                                    <Button
                                        key={color}
                                        variant={selectedColor === color ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedColor(color)}
                                        className={
                                            selectedColor === color
                                                ? 'bg-pink-500 hover:bg-pink-600'
                                                : 'hover:border-pink-500'
                                        }
                                    >
                                        {color}
                                    </Button>
                                ))}
                            </div>
                            {!selectedColor && (
                                <p className="text-sm text-red-500 mt-1">* Vui lòng chọn màu sắc</p>
                            )}
                        </div>
                        <div>
                            <h4 className="mb-2">Kích cỡ:</h4>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map((size) => (
                                    <Button
                                        key={size}
                                        variant={selectedSize === size ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedSize(size)}
                                        className={
                                            selectedSize === size
                                                ? 'bg-pink-500 hover:bg-pink-600'
                                                : 'hover:border-pink-500'
                                        }
                                    >
                                        {size}
                                    </Button>
                                ))}
                            </div>
                            {!selectedSize && (
                                <p className="text-sm text-red-500 mt-1">* Vui lòng chọn kích cỡ</p>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h4>Số lượng:</h4>
                                {selectedColor && selectedSize && product.inventory && product.inventory.length > 0 && (
                                    <span className="text-sm text-gray-500">
                                        Còn lại: {availableQuantity} sp
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-12 text-center">{quantity}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuantity(Math.min(availableQuantity, quantity + 1))}
                                    disabled={quantity >= availableQuantity}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            {selectedColor && selectedSize && availableQuantity === 0 && (
                                <p className="text-sm text-red-500 mt-1">* Sản phẩm này đã hết hàng</p>
                            )}
                            {selectedColor && selectedSize && availableQuantity > 0 && availableQuantity <= 5 && (
                                <p className="text-sm text-yellow-600 mt-1">
                                    ⚠️ Chỉ còn {availableQuantity} sản phẩm!
                                </p>
                            )}
                        </div>
                        <Button
                            size="lg"
                            className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                            onClick={handleAddToCart}
                            disabled={!product.inStock || !selectedColor || !selectedSize || availableQuantity === 0}
                        >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            {availableQuantity === 0 && selectedColor && selectedSize
                                ? 'Hết Hàng'
                                : product.inStock
                                    ? 'Thêm Vào Giỏ Hàng'
                                    : 'Hết Hàng'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}