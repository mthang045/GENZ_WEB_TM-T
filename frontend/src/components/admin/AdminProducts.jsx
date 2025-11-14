import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useProducts } from '../../contexts/ProductsContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ImageCropDialog } from './ImageCropDialog';
import { InventoryManagement } from './InventoryManagement';
import { ColorImageUpload } from './ColorImageUpload';


export function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [imageCropOpen, setImageCropOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '', price: '', category: '', brand: 'GENZ', rating: '4.5',
    description: '', image: '', features: [''], colors: [''],
    sizes: [''], inStock: true, inventory: [], colorImages: {}
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };
  
  const filteredProducts = products
    .map((p) => {
      let inStock = true;
      if (Array.isArray(p.stock)) {
        inStock = p.stock.some((s) => s.quantity > 0);
      } else if (typeof p.stock === 'number') {
        inStock = p.stock > 0;
      }
      return { ...p, inStock };
    })
    .filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      brand: product.brand,
      rating: product.rating.toString(),
      description: product.description,
      image: product.image,
      features: product.features,
      colors: product.colors,
      sizes: product.sizes,
      inStock: product.inStock,
      inventory: product.inventory || [],
      colorImages: product.colorImages || {}
    });
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setIsEditMode(false);
    setFormData({
      name: '', price: '', category: 'Fullface', brand: 'GENZ', rating: '4.5',
      description: '', image: '', features: [''], colors: [''],
      sizes: [''], inStock: true, inventory: [], colorImages: {}
    });
    setDialogOpen(true);
  };

  const handleDelete = (productId) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete);
    }
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleImageCropped = (croppedImage) => {
    setFormData({ ...formData, image: croppedImage });
  };

  const handleArrayInputChange = (index, value, field) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (index, field) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };
  
  const handleInventoryChange = (inventory) => {
    setFormData({ ...formData, inventory });
  };

  const handleColorImagesChange = (colorImages) => {
    setFormData({ ...formData, colorImages });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      price: parseInt(formData.price),
      category: formData.category,
      brand: formData.brand,
      rating: parseFloat(formData.rating),
      description: formData.description,
      image: formData.image,
      features: formData.features.filter(f => f.trim() !== ''),
      colors: formData.colors.filter(c => c.trim() !== ''),
      sizes: formData.sizes.filter(s => s.trim() !== ''),
      inStock: formData.inStock,
      inventory: formData.inventory,
      colorImages: formData.colorImages
    };

    if (isEditMode && selectedProduct) {
      updateProduct(selectedProduct.id, productData);
    } else {
      addProduct(productData);
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl">Quản Lý Sản Phẩm</h2>
          <p className="text-gray-500">Tổng: {products.length} sản phẩm</p>
        </div>
        <Button onClick={handleAddNew} className="bg-pink-500 hover:bg-pink-600">
          <Plus className="w-4 h-4 mr-2" />
          Thêm Sản Phẩm
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="relative aspect-square bg-gray-100">
              <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
              <Badge className="absolute top-3 left-3 bg-pink-500">{product.category}</Badge>
              {!product.inStock && (
                <Badge className="absolute top-3 right-3 bg-red-500">Hết hàng</Badge>
              )}
            </div>
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-pink-500">{formatPrice(product.price)}</p>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">⭐ {product.rating}</span>
                </div>
              </div>
              {product.inventory && product.inventory.length > 0 && (
                <div className="text-xs text-gray-500 border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span>Tồn kho:</span>
                    <Badge variant="secondary" className="text-xs">
                      {product.inventory.reduce((sum, inv) => sum + inv.quantity, 0)} sp
                    </Badge>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(product)}>
                  <Pencil className="w-4 h-4 mr-1" />
                  Sửa
                </Button>
                <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Cập nhật thông tin sản phẩm' : 'Nhập thông tin sản phẩm mới'}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Thông Tin Cơ Bản</TabsTrigger>
              <TabsTrigger value="images">Hình Ảnh Màu</TabsTrigger>
              <TabsTrigger value="inventory">Tồn Kho</TabsTrigger>
            </TabsList>
            <form className="mt-4" onSubmit={handleSubmit}>
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label>Hình ảnh sản phẩm</Label>
                  {formData.image ? (
                    <div className="relative aspect-square w-48 rounded-lg overflow-hidden border">
                      <img src={formData.image} alt="Product" className="w-full h-full object-cover" />
                      <Button type="button" size="sm" variant="secondary" className="absolute top-2 right-2" onClick={() => setImageCropOpen(true)}>
                        <ImageIcon className="w-4 h-4 mr-1" />
                        Đổi ảnh
                      </Button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" className="w-full" onClick={() => setImageCropOpen(true)}>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Tải Ảnh Lên
                    </Button>
                  )}
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tên sản phẩm *</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="GENZ Sport Pro" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Giá (VNĐ) *</Label>
                    <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="1250000" required />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Loại *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fullface">Fullface</SelectItem>
                        <SelectItem value="3/4">3/4</SelectItem>
                        <SelectItem value="Modular">Modular</SelectItem>
                        <SelectItem value="Half Face">Half Face</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Thương hiệu *</Label>
                    <Input value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} placeholder="GENZ" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Đánh giá *</Label>
                    <Input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mô tả *</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Mô tả sản phẩm..." rows={3} required />
                </div>

                {/* Dynamic Array Inputs */}
                {['features', 'colors', 'sizes'].map((field) => (
                  <div className="space-y-2" key={field}>
                    <div className="flex justify-between items-center">
                      <Label>{field === 'features' ? 'Tính năng' : field === 'colors' ? 'Màu sắc' : 'Kích cỡ'}</Label>
                      <Button type="button" size="sm" variant="outline" onClick={() => addArrayItem(field)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm
                      </Button>
                    </div>
                    {formData[field].map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => handleArrayInputChange(index, e.target.value, field)}
                          placeholder={field === 'features' ? 'Vỏ ABS cao cấp' : field === 'colors' ? 'Đen' : 'M'}
                        />
                        {formData[field].length > 1 && (
                          <Button type="button" size="sm" variant="outline" onClick={() => removeArrayItem(index, field)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="inStock">Còn hàng</Label>
                </div>
              </TabsContent>
              
              <TabsContent value="images" className="mt-0">
                <ColorImageUpload colors={formData.colors} colorImages={formData.colorImages} onChange={handleColorImagesChange} />
              </TabsContent>

              <TabsContent value="inventory" className="mt-0">
                <InventoryManagement colors={formData.colors} sizes={formData.sizes} inventory={formData.inventory} onChange={handleInventoryChange} />
              </TabsContent>

              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
                <Button type="submit" className="bg-pink-500 hover:bg-pink-600">
                  {isEditMode ? 'Cập Nhật' : 'Thêm Mới'}
                </Button>
              </div>
            </form>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <ImageCropDialog
        open={imageCropOpen}
        onClose={() => setImageCropOpen(false)}
        onImageCropped={handleImageCropped}
        currentImage={formData.image}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}