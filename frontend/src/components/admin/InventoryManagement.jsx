import React from 'react'; // Removed BOM
import { useState, useEffect } from 'react';
import { Package, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export function InventoryManagement({ colors, sizes, inventory, onChange }) {
  const [localInventory, setLocalInventory] = useState(inventory);

  // Memoize onChange to avoid dependency warning
  const stableOnChange = React.useCallback(onChange, []);
  const validColors = React.useMemo(() => colors.filter(c => c.trim()), [colors]);
  const validSizes = React.useMemo(() => sizes.filter(s => s.trim()), [sizes]);

  useEffect(() => {
    const newInventory = [];
    validColors.forEach(color => {
      validSizes.forEach(size => {
        const existing = localInventory.find(inv => inv.color === color && inv.size === size);
        newInventory.push({
          color,
          size,
          quantity: existing?.quantity || 0
        });
      });
    });
    setLocalInventory(newInventory);
    stableOnChange(newInventory);
  }, [validColors, validSizes]);

  const updateQuantity = (color, size, quantity) => {
    const newInventory = localInventory.map(inv =>
      inv.color === color && inv.size === size
        ? { ...inv, quantity: Math.max(0, quantity) }
        : inv
    );
    setLocalInventory(newInventory);
    onChange(newInventory);
  };

  const adjustQuantity = (color, size, delta) => {
    const current = localInventory.find(inv => inv.color === color && inv.size === size);
    if (current) {
      updateQuantity(color, size, current.quantity + delta);
    }
  };

  const getTotalQuantity = () => {
    return localInventory.reduce((sum, inv) => sum + inv.quantity, 0);
  };

  const getColorTotal = (color) => {
    return localInventory
      .filter(inv => inv.color === color)
      .reduce((sum, inv) => sum + inv.quantity, 0);
  };

  const getSizeTotal = (size) => {
    return localInventory
      .filter(inv => inv.size === size)
      .reduce((sum, inv) => sum + inv.quantity, 0);
  };

  const getQuantity = (color, size) => {
    return localInventory.find(inv => inv.color === color && inv.size === size)?.quantity || 0;
  };

  const getStatusColor = (quantity) => {
    if (quantity === 0)
      return 'bg-red-500';
    if (quantity <= 5)
      return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (colors.filter(c => c.trim()).length === 0 || sizes.filter(s => s.trim()).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Quản Lý Tồn Kho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Vui lòng thêm màu sắc và kích cỡ để quản lý tồn kho</p>
          </div>
        </CardContent>
      </Card>
    );
  }



  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Quản Lý Tồn Kho
          </CardTitle>
          <Badge variant="outline" className="text-sm">
            Tổng: {getTotalQuantity()} sản phẩm
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 bg-gray-50">Màu / Size</th>
                  {validSizes.map((size, idx) => (
                    <th key={idx} className="text-center p-2 bg-gray-50 min-w-32">
                      <div>{size}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        ({getSizeTotal(size)})
                      </div>
                    </th>
                  ))}
                  <th className="text-center p-2 bg-gray-50">Tổng</th>
                </tr>
              </thead>
              <tbody>
                {validColors.map((color, colorIdx) => (
                  <tr key={colorIdx} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border" style={{
                          backgroundColor: color.toLowerCase().includes('đen') ? 'black' :
                            color.toLowerCase().includes('trắng') ? 'white' :
                              color.toLowerCase().includes('đỏ') ? 'red' :
                                color.toLowerCase().includes('xanh') ? 'blue' :
                                  color.toLowerCase().includes('hồng') ? 'pink' :
                                    color.toLowerCase().includes('vàng') ? 'yellow' :
                                      'gray'
                        }} />
                        <span>{color}</span>
                      </div>
                    </td>
                    {validSizes.map((size, sizeIdx) => {
                      const quantity = getQuantity(color, size);
                      return (
                        <td key={sizeIdx} className="p-2">
                          <div className="flex items-center justify-center gap-1">
                            <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => adjustQuantity(color, size, -1)}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              value={quantity}
                              onChange={(e) => updateQuantity(color, size, parseInt(e.target.value) || 0)}
                              className="h-8 w-16 text-center p-1"
                            />
                            <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => adjustQuantity(color, size, 1)}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex justify-center mt-1">
                            <div className={`h-1 w-12 rounded ${getStatusColor(quantity)}`} />
                          </div>
                        </td>
                      );
                    })}
                    <td className="p-2 text-center">
                      <Badge variant="secondary">{getColorTotal(color)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t">
            <span>Trạng thái:</span>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-green-500" />
              <span>Còn hàng</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-yellow-500" />
              <span>Sắp hết (≤5)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-red-500" />
              <span>Hết hàng</span>
            </div>
          </div>
          <div className="flex gap-2 pt-2 border-t">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                const newInventory = localInventory.map(inv => ({ ...inv, quantity: 10 }));
                setLocalInventory(newInventory);
                onChange(newInventory);
              }}
            >
              Đặt tất cả = 10
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                const newInventory = localInventory.map(inv => ({ ...inv, quantity: 0 }));
                setLocalInventory(newInventory);
                onChange(newInventory);
              }}
            >
              Xóa tất cả
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}