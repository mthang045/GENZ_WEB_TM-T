import { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { ImageCropDialog } from './ImageCropDialog';

export function ColorImageUpload({ colors, colorImages, onChange }) {
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');

  const handleImageCropped = (croppedImage) => {
    if (selectedColor) {
      onChange({ ...colorImages, [selectedColor]: croppedImage });
    }
  };

  const handleRemoveImage = (color) => {
    const newColorImages = { ...colorImages };
    delete newColorImages[color];
    onChange(newColorImages);
  };

  const openCropForColor = (color) => {
    setSelectedColor(color);
    setCropDialogOpen(true);
  };

  const validColors = colors.filter(c => c.trim());

  if (validColors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Hình Ảnh Theo Màu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Vui lòng thêm màu sắc trước</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Hình Ảnh Theo Màu Sắc
          </CardTitle>
          <p className="text-sm text-gray-500">
            Tải ảnh riêng cho từng màu. Nếu không có, sẽ dùng ảnh chung.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {validColors.map((color) => (
              <div key={color} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border-2"
                    style={{
                      backgroundColor: color.toLowerCase().includes('đen') ? 'black' :
                        color.toLowerCase().includes('trắng') ? 'white' :
                        color.toLowerCase().includes('đỏ') ? 'red' :
                        color.toLowerCase().includes('xanh') ? 'blue' :
                        color.toLowerCase().includes('hồng') ? 'pink' :
                        color.toLowerCase().includes('vàng') ? 'yellow' :
                        color.toLowerCase().includes('xám') ? 'gray' :
                        'lightgray'
                    }}
                  />
                  <Label className="flex-1">{color}</Label>
                </div>
                
                {colorImages[color] ? (
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img src={colorImages[color]} alt={color} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button type="button" size="sm" variant="secondary" onClick={() => openCropForColor(color)}>
                        <ImageIcon className="w-4 h-4 mr-1" />
                        Đổi
                      </Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => handleRemoveImage(color)}>
                        <X className="w-4 h-4 mr-1" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full aspect-square flex flex-col items-center justify-center gap-2"
                    onClick={() => openCropForColor(color)}
                  >
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                    <span className="text-xs">Thêm ảnh</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ImageCropDialog
        open={cropDialogOpen}
        onClose={() => {
          setCropDialogOpen(false);
          setSelectedColor('');
        }}
        onImageCropped={handleImageCropped}
        currentImage={selectedColor ? colorImages[selectedColor] : undefined}
      />
    </>
  );
}