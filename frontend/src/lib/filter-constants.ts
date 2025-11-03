// Static filter constants - not dependent on products-data
export const categories = [
  'Tất cả',
  'Fullface',
  '3/4',
  'Half',
  'Nón bảo hiểm khác'
]

export const priceRanges = [
  { label: 'Tất cả', min: 0, max: 999999999 },
  { label: 'Dưới 500k', min: 0, max: 500000 },
  { label: '500k - 1 triệu', min: 500000, max: 1000000 },
  { label: '1 - 2 triệu', min: 1000000, max: 2000000 },
  { label: 'Trên 2 triệu', min: 2000000, max: 999999999 }
]
