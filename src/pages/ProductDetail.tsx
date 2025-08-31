import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Phone, ArrowLeft, Star, ShoppingCart, Heart, Share2, Check, Truck, Shield, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  product_id: string;
  product_name: string;
  selling_price: number;
  image_url?: string;
  stock_quantity: number;
  notes?: string;
  category_id?: string;
}

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isInCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);

      // Fetch related products
      if (data.category_id) {
        const { data: related } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', data.category_id)
          .neq('id', id)
          .gt('stock_quantity', 0)
          .limit(4);
        
        setRelatedProducts(related || []);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      navigate('/store/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        product_id: product.product_id,
        product_name: product.product_name,
        selling_price: product.selling_price,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity,
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">المنتج غير موجود</h2>
          <p className="text-muted-foreground mb-4">عذراً، لم نجد المنتج المطلوب</p>
          <Link to="/store/products">
            <Button className="btn-gradient">العودة للمنتجات</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <Phone className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-bold gradient-text">Nouacer Telecom</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="glass-card overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.product_name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Phone className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </Card>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-right">{product.product_name}</h1>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4" />
                </div>
                <span className="text-sm text-muted-foreground">(24 تقييم)</span>
                <Badge variant="secondary" className="text-xs">
                  ID: {product.product_id}
                </Badge>
              </div>

              <div className="text-4xl font-bold text-primary mb-4">
                {formatCurrency(product.selling_price)}
              </div>

              <div className="flex items-center gap-2 mb-6">
                {product.stock_quantity > 0 ? (
                  <Badge className="bg-success text-success-foreground">
                    <Check className="h-3 w-3 mr-1" />
                    متوفر في المخزن ({product.stock_quantity} قطعة)
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    غير متوفر
                  </Badge>
                )}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-semibold">الكمية:</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 p-0"
                  >
                    -
                  </Button>
                  <span className="min-w-[3rem] text-center bg-muted px-3 py-2 rounded-md">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="h-10 w-10 p-0"
                    disabled={quantity >= product.stock_quantity}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className="flex-1 btn-gradient text-lg py-6"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {isInCart(product.id) ? 'إضافة المزيد' : 'أضف للسلة'}
                </Button>
                <Link to="/store/checkout" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full text-lg py-6"
                    size="lg"
                    disabled={product.stock_quantity === 0}
                  >
                    اشتري الآن
                  </Button>
                </Link>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-card p-4 text-center">
                <Truck className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">توصيل سريع</h4>
                <p className="text-sm text-muted-foreground">توصيل خلال 24 ساعة</p>
              </Card>
              <Card className="glass-card p-4 text-center">
                <Shield className="h-8 w-8 text-success mx-auto mb-2" />
                <h4 className="font-semibold mb-1">ضمان أصلي</h4>
                <p className="text-sm text-muted-foreground">ضمان الوكيل المعتمد</p>
              </Card>
              <Card className="glass-card p-4 text-center">
                <Headphones className="h-8 w-8 text-secondary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">دعم فني</h4>
                <p className="text-sm text-muted-foreground">خدمة عملاء 24/7</p>
              </Card>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="glass-card mb-12">
          <CardContent className="p-6">
            <Tabs defaultValue="description" className="w-full" dir="rtl">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">الوصف</TabsTrigger>
                <TabsTrigger value="specs">المواصفات</TabsTrigger>
                <TabsTrigger value="reviews">التقييمات</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-6">
                <div className="prose max-w-none text-right">
                  <p className="text-muted-foreground leading-relaxed">
                    {product.notes || 'لا يوجد وصف متاح لهذا المنتج حالياً. للمزيد من المعلومات، يرجى الاتصال بخدمة العملاء.'}
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="specs" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold">رقم المنتج:</span>
                      <span>{product.product_id}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold">الكمية المتاحة:</span>
                      <span>{product.stock_quantity} قطعة</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="mt-6">
                <div className="text-center py-8">
                  <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">لا توجد تقييمات بعد</h3>
                  <p className="text-muted-foreground">كن أول من يقيم هذا المنتج</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold gradient-text mb-6 text-center">منتجات مشابهة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} to={`/store/product/${relatedProduct.id}`}>
                  <Card className="glass-card hover-lift group cursor-pointer">
                    <div className="relative overflow-hidden rounded-t-lg">
                      {relatedProduct.image_url ? (
                        <img
                          src={relatedProduct.image_url}
                          alt={relatedProduct.product_name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Phone className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-2 line-clamp-2 text-right">
                        {relatedProduct.product_name}
                      </h4>
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(relatedProduct.selling_price)}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};