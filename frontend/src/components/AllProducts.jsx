import { useState, useMemo, useEffect } from 'react';
import { Filter, X, Grid3x3, LayoutList, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { ProductCard } from './ProductCard';
import { ProductCarousel } from './ProductCarousel';
import { useProducts } from '../contexts/ProductsContext';
import { categories, priceRanges } from '../lib/filter-constants';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

const PRODUCTS_PER_ROW = 4;
export function AllProducts({ onProductClick, searchQuery = '' }) {
    const { products } = useProducts();
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [selectedPriceRange, setSelectedPriceRange] = useState(0);
    const [sortBy, setSortBy] = useState('default');
    const [viewMode, setViewMode] = useState('carousel');
    const [displayRows, setDisplayRows] = useState(1);
    // Helper: Chuẩn hóa sản phẩm
    const normalizeProduct = (p) => {
        let inStock = true;
        if (Array.isArray(p.stock)) {
            inStock = p.stock.some((s) => s.quantity > 0);
        } else if (typeof p.stock === 'number') {
            inStock = p.stock > 0;
        } else if (p.inStock !== undefined) {
            inStock = p.inStock;
        }
        return {
            id: p.id || p._id || String(p._id || Math.random()),
            name: p.name || p.title || 'No name',
            price: p.price ?? 0,
            image: (p.images && p.images[0]) || p.image || '',
            category: p.category || 'Khác',
            brand: p.brand || 'GenZ',
            rating: p.rating ?? 0,
            description: p.description || '',
            features: p.features || [],
            colors: p.colors || [],
            sizes: p.sizes || [],
            inStock,
            inventory: p.inventory || [],
            colorImages: p.colorImages || {},
        };
    };

    // Helper: Lọc sản phẩm
    const filterProducts = (list) => {
        let filtered = list;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter((product) =>
                product.name.toLowerCase().includes(q) ||
                product.description.toLowerCase().includes(q) ||
                product.category.toLowerCase().includes(q)
            );
        }
        filtered = filtered.filter(product => product.inStock !== false);
        if (selectedCategory !== 'Tất cả') {
            filtered = filtered.filter((product) => product.category === selectedCategory);
        }
        const range = priceRanges[selectedPriceRange];
        filtered = filtered.filter((product) => product.price >= range.min && product.price <= range.max);
        return filtered;
    };

    // Helper: Sắp xếp sản phẩm
    const sortProducts = (list) => {
        switch (sortBy) {
            case 'price-asc':
                return [...list].sort((a, b) => a.price - b.price);
            case 'price-desc':
                return [...list].sort((a, b) => b.price - a.price);
            case 'rating':
                return [...list].sort((a, b) => b.rating - a.rating);
            default:
                return list;
        }
    };

    const filteredProducts = useMemo(() => {
        const normalized = products.map(normalizeProduct);
        const filtered = filterProducts(normalized);
        return sortProducts(filtered);
    }, [products, searchQuery, selectedCategory, selectedPriceRange, sortBy]);
    // Reset display count when filters change
    useEffect(() => {
        setDisplayRows(1);
    }, [searchQuery, selectedCategory, selectedPriceRange, sortBy]);
    const handleLoadMore = () => {
        setDisplayRows(prev => prev + 1);
    };
    const handleResetFilters = () => {
        setSelectedCategory('Tất cả');
        setSelectedPriceRange(0);
        setDisplayRows(1);
    };
    // Split products into rows for carousel view
    const productRows = [];
    if (viewMode === 'carousel') {
        for (let i = 0; i < filteredProducts.length; i += PRODUCTS_PER_ROW) {
            productRows.push(filteredProducts.slice(i, i + PRODUCTS_PER_ROW));
        }
    }
    const displayedRows = productRows.slice(0, displayRows);
    const hasMoreRows = displayRows < productRows.length;
    const totalDisplayed = viewMode === 'carousel'
        ? displayedRows.reduce((acc, row) => acc + row.length, 0)
        : filteredProducts.length;
    const FilterContent = () => (
        <div className="space-y-6">
            <div>
                <h3 className="mb-3">Loại mũ</h3>
                <div className="space-y-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                                selectedCategory === category
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="mb-3">Khoảng giá</h3>
                <div className="space-y-2">
                    {priceRanges.map((range, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedPriceRange(index)}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                                selectedPriceRange === index
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleResetFilters}>
                Xóa Bộ Lọc
            </Button>
        </div>
    );
    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl mb-2">Tất Cả Sản Phẩm</h2>
                        <p className="text-gray-600">
                            {viewMode === 'carousel'
                                ? `Hiển thị ${totalDisplayed} / ${filteredProducts.length} sản phẩm`
                                : `Tìm thấy ${filteredProducts.length} sản phẩm`}
                            {searchQuery && ` cho "${searchQuery}"`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v)} className="w-auto">
                            <TabsList>
                                <TabsTrigger value="carousel" className="gap-2">
                                    <LayoutList className="w-4 h-4" />
                                    <span className="hidden sm:inline">Carousel</span>
                                </TabsTrigger>
                                <TabsTrigger value="grid" className="gap-2">
                                    <Grid3x3 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Grid</span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <Sheet>
                            <SheetTrigger className="md:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
                                <Filter className="w-4 h-4" />
                                Bộ Lọc
                            </SheetTrigger>
                            <SheetContent side="left">
                                <SheetHeader>
                                    <SheetTitle>Bộ Lọc</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6">
                                    <FilterContent />
                                </div>
                            </SheetContent>
                        </Sheet>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border rounded-lg bg-white"
                        >
                            <option value="default">Mặc định</option>
                            <option value="price-asc">Giá: Thấp đến Cao</option>
                            <option value="price-desc">Giá: Cao đến Thấp</option>
                            <option value="rating">Đánh giá cao nhất</option>
                        </select>
                    </div>
                </div>
                {(selectedCategory !== 'Tất cả' || selectedPriceRange !== 0) && (
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        <span className="text-sm text-gray-600">Đang lọc:</span>
                        {selectedCategory !== 'Tất cả' && (
                            <Badge variant="secondary" className="gap-1">
                                {selectedCategory}
                                <button onClick={() => setSelectedCategory('Tất cả')}>
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        )}
                        {selectedPriceRange !== 0 && (
                            <Badge variant="secondary" className="gap-1">
                                {priceRanges[selectedPriceRange].label}
                                <button onClick={() => setSelectedPriceRange(0)}>
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        )}
                    </div>
                )}
                <div className="grid lg:grid-cols-4 gap-8">
                    <aside className="hidden md:block">
                        <div className="sticky top-24 bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="flex items-center gap-2 mb-6">
                                <Filter className="w-5 h-5" />
                                Bộ Lọc
                            </h3>
                            <FilterContent />
                        </div>
                    </aside>
                    <div className="lg:col-span-3">
                        {filteredProducts.length > 0 ? (
                            <>
                                {viewMode === 'carousel' ? (
                                    /* Carousel View - Rows of horizontal scrolling */
                                    <div className="space-y-8">
                                        {displayedRows.map((row, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-sm text-gray-500">
                                                        Hàng {index + 1}
                                                    </h3>
                                                    <span className="text-sm text-gray-400">
                                                        {row.length} sản phẩm
                                                    </span>
                                                </div>
                                                <ProductCarousel products={row} onProductClick={onProductClick} />
                                            </div>
                                        ))}
                                        {hasMoreRows && (
                                            <div className="flex justify-center mt-8">
                                                <Button
                                                    size="lg"
                                                    variant="outline"
                                                    onClick={handleLoadMore}
                                                    className="min-w-[200px] hover:bg-pink-50 hover:border-pink-500 hover:text-pink-500 transition-all"
                                                >
                                                    <ChevronDown className="w-4 h-4 mr-2" />
                                                    Xem Thêm Hàng ({productRows.length - displayRows} hàng)
                                                </Button>
                                            </div>
                                        )}
                                        {!hasMoreRows && productRows.length > 1 && (
                                            <div className="text-center mt-8 py-6 border-t">
                                                <p className="text-gray-500">
                                                    ✓ Đã hiển thị tất cả {filteredProducts.length} sản phẩm
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Grid View - Traditional grid */
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {filteredProducts.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                onQuickView={onProductClick}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">Không tìm thấy sản phẩm nào</p>
                                <Button variant="outline" onClick={handleResetFilters}>
                                    Xóa Bộ Lọc
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}