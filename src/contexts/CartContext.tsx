import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  selling_price: number;
  image_url?: string;
  quantity: number;
  stock_quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('nouacer-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('nouacer-cart', JSON.stringify(items));
  }, [items]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Check stock limit
        if (existingItem.quantity >= product.stock_quantity) {
          toast({
            title: "مخزون غير كافي",
            description: "عذراً، لا يمكن إضافة المزيد من هذا المنتج",
            variant: "destructive",
          });
          return prevItems;
        }
        
        toast({
          title: "تم تحديث السلة",
          description: `تمت زيادة كمية ${product.product_name}`,
        });
        
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        toast({
          title: "تمت الإضافة للسلة",
          description: `تم إضافة ${product.product_name} إلى السلة`,
        });
        
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => {
      const item = prevItems.find(item => item.id === productId);
      if (item) {
        toast({
          title: "تم الحذف من السلة",
          description: `تم حذف ${item.product_name} من السلة`,
        });
      }
      return prevItems.filter(item => item.id !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === productId) {
          const newQuantity = Math.min(quantity, item.stock_quantity);
          if (newQuantity !== quantity) {
            toast({
              title: "مخزون محدود",
              description: "تم تعديل الكمية حسب المخزن المتاح",
              variant: "destructive",
            });
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "تم تفريغ السلة",
      description: "تم حذف جميع المنتجات من السلة",
    });
  };

  const isInCart = (productId: string) => {
    return items.some(item => item.id === productId);
  };

  const value = {
    items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};