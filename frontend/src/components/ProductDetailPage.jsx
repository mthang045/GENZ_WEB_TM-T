import { useState, useEffect } from 'react';
import { ArrowLeft, Star, ShoppingCart, Minus, Plus, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../contexts/ProductsContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProductCard } from './ProductCard';

export function ProductDetailPage({ product, onBack, onProductClick }) {
    const { addToCart } = useCart();
    const { products } = useProducts();
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState(product?.image || '');

    // Reset selections when product changes
    useEffect(() => {
        if (!product) return;
        setSelectedColor('');
        setSelectedSize('');
        setQuantity(1);
        setMainImage(product.image);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [product]);

    // Update main image when color is selected
    useEffect(() => {
        if (!product) return;
        if (selectedColor && product.colorImages && product.colorImages[selectedColor]) {
            setMainImage(product.colorImages[selectedColor]);
        } else {
            // Fallback to default product image if no color selected or no specific image
            setMainImage(product.image);
        }
    }, [selectedColor, product]); // Phụ thuộc vào product thay vì product.colorImages và product.image

    // If product is null (page reload), show loading or redirect
    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <Button variant="ghost" onClick={onBack} className="mb-6 hover:text-pink-500">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay Lại
                    </Button>
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">Không tìm thấy sản phẩm</p>
                        <Button onClick={onBack} className="bg-pink-500 hover:bg-pink-600">
                            Về Trang Chủ
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Get available quantity for selected variant
    const getAvailableQuantity = (color, size) => {
        if (!product.inventory || product.inventory.length === 0)
            return 999;
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
        // Reset after adding
        setQuantity(1);
    };

    // Get related products (same category, different product)
    const relatedProducts = products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky Back Button Header */}
            <div className="bg-white border-b sticky top-16 z-10">
                <div className="container mx-auto px-4 py-4">
                    <Button variant="ghost" onClick={onBack} className="hover:text-pink-500">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay Lại
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-8 p-6 lg:p-12">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <ImageWithFallback src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                <button
                                    onClick={() => setMainImage(product.image)}
                                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${mainImage === product.image ? 'border-pink-500' : 'border-transparent'}`}
                                >
                                    <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                </button>
                                {product.colorImages && Object.entries(product.colorImages).map(([color, imageUrl]) => (
                                    <button
                                        key={color}
                                        onClick={() => setMainImage(imageUrl)}
                                        className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${mainImage === imageUrl ? 'border-pink-500' : 'border-transparent'} relative`}
                                    >
                                        <ImageWithFallback src={imageUrl} alt={`${product.name} - ${color}`} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                                            {color}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Details & Actions */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-pink-500">{product.category}</Badge>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-600">{product.brand}</span>
                            </div>
                            <div>
                                <h1 className="text-3xl mb-2">{product.name}</h1>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${i < Math.floor(product.rating)
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-gray-600">({product.rating})</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-3xl text-pink-500">{formatPrice(product.price)}</p>
                            </div>
                            <Separator />
                            <div>
                                <h3 className="mb-2">Mô tả sản phẩm:</h3>
                                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                            </div>
                            {(product.features && product.features.length > 0) && (
                                <div>
                                    <h3 className="mb-3">Tính năng nổi bật:</h3>
                                    <ul className="space-y-2">
                                        {(product.features || []).map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <Separator />
                            <div>
                                <h4 className="mb-3">Màu sắc:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(product.colors || []).map((color) => (
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
                                    <p className="text-sm text-red-500 mt-2">* Vui lòng chọn màu sắc</p>
                                )}
                            </div>
                            <div>
                                <h4 className="mb-3">Kích cỡ:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(product.sizes || []).map((size) => (
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
                                    <p className="text-sm text-red-500 mt-2">* Vui lòng chọn kích cỡ</p>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4>Số lượng:</h4>
                                    {selectedColor && selectedSize && product.inventory && product.inventory.length > 0 && (
                                        <span className="text-sm text-gray-500">
                                            Còn lại: {availableQuantity} sp
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 border rounded-lg p-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <span className="w-12 text-center">{quantity}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setQuantity(Math.min(availableQuantity, quantity + 1))}
                                            disabled={quantity >= availableQuantity}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                {selectedColor && selectedSize && availableQuantity === 0 && (
                                    <p className="text-sm text-red-500 mt-2">* Sản phẩm này đã hết hàng</p>
                                )}
                                {selectedColor && selectedSize && availableQuantity > 0 && availableQuantity <= 5 && (
                                    <p className="text-sm text-yellow-600 mt-2">
                                        ⚠️ Chỉ còn {availableQuantity} sản phẩm!
                                    </p>
                                )}
                            </div>
                            <Button
                                size="lg"
                                className="w-full bg-pink-500 hover:bg-pink-600 text-white h-14 text-lg"
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
                            <div className="flex items-center gap-2 text-sm">
                                {product.inStock ? (
                                    <>
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-gray-600">Còn hàng</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span className="text-gray-600">Hết hàng</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {(relatedProducts && relatedProducts.length > 0) && (
                    <div className="mt-16">
                        <div className="mb-8">
                            <h2 className="text-2xl mb-2">Sản Phẩm Liên Quan</h2>
                            <p className="text-gray-600">
                                Các sản phẩm tương tự trong danh mục {product.category}
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(relatedProducts || []).map((relatedProduct) => (
                                <ProductCard
                                    key={relatedProduct.id}
                                    product={relatedProduct}
                                    onQuickView={() => onProductClick(relatedProduct)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}