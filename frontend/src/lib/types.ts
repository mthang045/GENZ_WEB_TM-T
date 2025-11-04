export interface ProductVariant {
  color: string
  size: string
  quantity: number
}

export interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  brand: string
  rating: number
  description: string
  features: string[]
  colors: string[]
  sizes: string[]
  inStock: boolean
  inventory?: ProductVariant[] // Số lượng tồn kho theo màu và size
  colorImages?: { [color: string]: string } // Hình ảnh riêng cho từng màu
}

export interface CartItem extends Product {
  productId: string
  quantity: number
  selectedColor: string
  selectedSize: string
}
