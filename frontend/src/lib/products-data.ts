import { Product } from './types'

export const products: Product[] = [
  {
    id: '1',
    name: 'GENZ Sport Pro',
    price: 1250000,
    image: 'https://images.unsplash.com/photo-1704977733553-e3d7d92c4d66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwaGVsbWV0JTIwc2FmZXR5fGVufDF8fHx8MTc1OTg0OTUxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Fullface',
    brand: 'GENZ',
    rating: 4.8,
    description: 'Mũ bảo hiểm fullface cao cấp với công nghệ chống va đập tiên tiến, thiết kế khí động học tối ưu.',
    features: [
      'Vỏ ABS cao cấp chống va đập',
      'Lót mũ có thể tháo rời và giặt được',
      'Kính chống UV, chống trầy xước',
      'Hệ thống thông gió đa điểm',
      'Khóa an toàn đạt chuẩn DOT'
    ],
    colors: ['Đen', 'Trắng', 'Đỏ', 'Xanh Dương'],
    sizes: ['M', 'L', 'XL'],
    inStock: true
  },
  {
    id: '2',
    name: 'GENZ Classic Black',
    price: 890000,
    image: 'https://images.unsplash.com/photo-1631997673188-c0c07702bd25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1vdG9yY3ljbGUlMjBoZWxtZXR8ZW58MXx8fHwxNzU5ODQ5NTEwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: '3/4',
    brand: 'GENZ',
    rating: 4.5,
    description: 'Thiết kế cổ điển, phong cách thời thượng với độ bảo vệ cao cho người dùng thành phố.',
    features: [
      'Thiết kế 3/4 thoáng mát',
      'Vỏ ngoài bền bỉ',
      'Kính che nắng tích hợp',
      'Trọng lượng nhẹ chỉ 950g',
      'Đạt chuẩn an toàn quốc gia'
    ],
    colors: ['Đen', 'Xám', 'Nâu'],
    sizes: ['S', 'M', 'L'],
    inStock: true
  },
  {
    id: '3',
    name: 'GENZ Racing Edition',
    price: 1850000,
    image: 'https://images.unsplash.com/photo-1682345334042-3b4b8ab0c29a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWNpbmclMjBoZWxtZXQlMjBtb2Rlcm58ZW58MXx8fHwxNzU5ODQ5NTExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Fullface',
    brand: 'GENZ',
    rating: 4.9,
    description: 'Mũ bảo hiểm đua chuyên nghiệp với công nghệ hàng không vũ trụ, dành cho tốc độ cao.',
    features: [
      'Vỏ sợi carbon siêu nhẹ',
      'Kính Pinlock chống sương mù',
      'Hệ thống thông gió tuần hoàn tối ưu',
      'Spoiler khí động học',
      'Đạt chuẩn ECE R22.06'
    ],
    colors: ['Đen Bóng', 'Trắng/Đỏ', 'Đen/Vàng'],
    sizes: ['M', 'L', 'XL'],
    inStock: true
  },
  {
    id: '4',
    name: 'GENZ Urban Style',
    price: 750000,
    image: 'https://images.unsplash.com/photo-1552293164-607ec8360528?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmJpa2UlMjBoZWxtZXQlMjBzcG9ydHxlbnwxfHx8fDE3NTk4NDk1MTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: '3/4',
    brand: 'GENZ',
    rating: 4.6,
    description: 'Phong cách đô thị năng động, hoàn hảo cho việc di chuyển hàng ngày trong thành phố.',
    features: [
      'Thiết kế thời trang hiện đại',
      'Lớp đệm êm ái thoải mái',
      'Kính UV400 bảo vệ mắt',
      'Dễ dàng vệ sinh',
      'Giá cả phải chăng'
    ],
    colors: ['Trắng', 'Đen Nhám', 'Xanh Mint'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    id: '5',
    name: 'GENZ Adventure Pro',
    price: 1650000,
    image: 'https://images.unsplash.com/photo-1626275850959-2f19cd600b0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydCUyMG1vdG9yY3ljbGUlMjBoZWxtZXQlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NTk4NDk3NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Modular',
    brand: 'GENZ',
    rating: 4.7,
    description: 'Mũ bảo hiểm modular đa năng, lý tưởng cho những chuyến phượt xa và touring.',
    features: [
      'Thiết kế modular linh hoạt',
      'Kính chống trầy cao cấp',
      'Sẵn sàng cho tai nghe Bluetooth',
      'Thông gió điều chỉnh được',
      'Trọng lượng cân bằng tốt'
    ],
    colors: ['Đen Nhám', 'Xám Xanh', 'Trắng Bạc'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    inStock: true
  },
  {
    id: '6',
    name: 'GENZ Retro Vintage',
    price: 950000,
    image: 'https://images.unsplash.com/photo-1590093105704-fddd246ab64f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWxmJTIwZmFjZSUyMGhlbG1ldCUyMHZpbnRhZ2V8ZW58MXx8fHwxNzYwMzYzMDQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Half Face',
    brand: 'GENZ',
    rating: 4.4,
    description: 'Phong cách retro cổ điển, phù hợp với xe cruiser và classic bike.',
    features: [
      'Thiết kế half face cổ điển',
      'Da PU cao cấp bên trong',
      'Khóa kim loại bền bỉ',
      'Phong cách vintage độc đáo',
      'Nhẹ và thoải mái'
    ],
    colors: ['Nâu Da', 'Đen', 'Kem'],
    sizes: ['S', 'M', 'L'],
    inStock: true
  },
  {
    id: '7',
    name: 'GENZ Full Carbon',
    price: 2350000,
    image: 'https://images.unsplash.com/photo-1673089858109-4e0e25ce4d4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdWxsJTIwZmFjZSUyMG1vdG9yY3ljbGUlMjBoZWxtZXR8ZW58MXx8fHwxNzYwMzYzMDQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Fullface',
    brand: 'GENZ',
    rating: 5.0,
    description: 'Cao cấp nhất với vỏ carbon nguyên khối, siêu nhẹ và an toàn tuyệt đối.',
    features: [
      'Vỏ carbon nguyên khối 100%',
      'Trọng lượng siêu nhẹ 1100g',
      'Kính Pinlock 120 chống mờ',
      'Lót mũ kháng khuẩn cao cấp',
      'Đạt chuẩn Snell & ECE'
    ],
    colors: ['Carbon Đen', 'Carbon Xám'],
    sizes: ['M', 'L', 'XL'],
    inStock: true
  },
  {
    id: '8',
    name: 'GENZ Youth Edition',
    price: 590000,
    image: 'https://images.unsplash.com/photo-1685826398847-0a5744b8be1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwaGVsbWV0JTIwd2hpdGV8ZW58MXx8fHwxNzYwMzYzMDQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: '3/4',
    brand: 'GENZ',
    rating: 4.3,
    description: 'Dành cho giới trẻ với giá cả phải chăng, thiết kế trẻ trung và nhiều màu sắc.',
    features: [
      'Giá phải chăng cho học sinh',
      'Nhiều màu sắc trẻ trung',
      'Nhẹ và dễ sử dụng',
      'An toàn đạt chuẩn',
      'Bảo hành 12 tháng'
    ],
    colors: ['Trắng', 'Hồng', 'Xanh Dương', 'Đen', 'Vàng'],
    sizes: ['S', 'M'],
    inStock: true
  }
]

export const categories = ['Tất cả', 'Fullface', '3/4', 'Modular', 'Half Face']
export const brands = ['Tất cả', 'GENZ']
export const priceRanges = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: 'Dưới 1 triệu', min: 0, max: 1000000 },
  { label: '1-1.5 triệu', min: 1000000, max: 1500000 },
  { label: '1.5-2 triệu', min: 1500000, max: 2000000 },
  { label: 'Trên 2 triệu', min: 2000000, max: Infinity }
]
