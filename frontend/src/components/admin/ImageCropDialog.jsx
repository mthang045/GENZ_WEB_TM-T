import { useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { toast } from 'sonner';

export function ImageCropDialog({ open, onClose, onImageCropped, currentImage }) {
  const [imageSrc, setImageSrc] = useState(currentImage || '');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB');
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
      });
      reader.readAsDataURL(file);
    }
  };

  const createImage = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }
    canvas.width = 800;
    canvas.height = 800;
    ctx.drawImage(
      image,
      pixelCrop.x, pixelCrop.y,
      pixelCrop.width, pixelCrop.height,
      0, 0,
      800, 800
    );
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      toast.error('Vui lòng chọn ảnh');
      return;
    }
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onImageCropped(croppedImage);
      handleClose();
      toast.success('Đã cắt ảnh thành công!');
    } catch (e) {
      console.error(e);
      toast.error('Lỗi khi cắt ảnh');
    }
  };

  const handleClose = () => {
    setImageSrc(currentImage || '');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tải Ảnh Sản Phẩm</DialogTitle>
          <DialogDescription>Chọn ảnh và điều chỉnh khung hình vuông 1:1</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!imageSrc && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Click để chọn ảnh</p>
                <p className="text-sm text-gray-400">PNG, JPG tối đa 5MB</p>
              </label>
            </div>
          )}
          
          {imageSrc && (
            <>
              <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              <div className="space-y-2">
                <Label>Phóng to/Thu nhỏ</Label>
                <Slider
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                  min={1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setImageSrc('');
                  const input = document.getElementById('image-upload');
                  if (input) input.value = '';
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Chọn Ảnh Khác
              </Button>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Hủy</Button>
          <Button onClick={handleCrop} disabled={!imageSrc} className="bg-pink-500 hover:bg-pink-600">
            Áp Dụng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}