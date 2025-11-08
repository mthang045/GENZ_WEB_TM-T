import { Button } from './ui/button'
import { ProductCarousel } from './ProductCarousel'
import { useProducts } from '../contexts/ProductsContext'
import { Product } from '../lib/types'

interface FeaturedProductsProps {
  onProductClick: (product: Product) => void
  onViewAll: () => void
}

export function FeaturedProducts({ onProductClick, onViewAll }: FeaturedProductsProps) {
  const { products } = useProducts()
  
  // Normalize products and calculate inStock from stock array
  const normalizedProducts = products.map((p: any) => {
    let inStock = true
    if (Array.isArray(p.stock)) {
      inStock = p.stock.some((s: any) => s.quantity > 0)
    } else if (typeof p.stock === 'number') {
      inStock = p.stock > 0
    }
    return { ...p, inStock }
  })
  
  // Filter products that are in stock and get first 8
  const featuredProducts = normalizedProducts
    .filter(product => product.inStock !== false)
    .slice(0, 8)

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4">
            Sản Phẩm Nổi Bật
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Khám phá bộ sưu tập mũ bảo hiểm chất lượng cao với thiết kế hiện đại và công nghệ an toàn tiên tiến
          </p>
        </div>

        <ProductCarousel 
          products={featuredProducts}
          onProductClick={onProductClick}
        />

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            className="border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white px-8"
            onClick={onViewAll}
          >
            Xem Tất Cả Sản Phẩm
          </Button>
        </div>
      </div>
    </section>
  )
}
