import React, { useState } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';

export const ShoppingCartButton: React.FC = () => {
  const { totalItems } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <ShoppingCartContent />
      </SheetContent>
    </Sheet>
  );
};

const ShoppingCartContent: React.FC = () => {
  const { items, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">السلة فارغة</h3>
        <p className="text-muted-foreground mb-6">لم تقم بإضافة أي منتجات بعد</p>
        <Link to="/store/products">
          <Button className="btn-gradient">
            تصفح المنتجات
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SheetHeader>
        <SheetTitle className="text-right">سلة التسوق</SheetTitle>
        <SheetDescription className="text-right">
          {items.length} منتج في السلة
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1 line-clamp-2">{item.product_name}</h4>
                    <p className="text-primary font-bold text-lg">
                      {formatCurrency(item.selling_price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="min-w-[2rem] text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                        disabled={item.quantity >= item.stock_quantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFromCart(item.id)}
                        className="h-8 w-8 p-0 ml-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <span className="text-sm text-muted-foreground">المجموع الفرعي:</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(item.selling_price * item.quantity)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">المجموع الكلي:</span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(totalPrice)}
          </span>
        </div>
        
        <div className="space-y-2">
          <Link to="/store/checkout" className="block">
            <Button className="w-full btn-gradient" size="lg">
              إتمام الشراء
            </Button>
          </Link>
          <Button variant="outline" onClick={clearCart} className="w-full">
            تفريغ السلة
          </Button>
        </div>
      </div>
    </div>
  );
};