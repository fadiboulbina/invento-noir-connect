import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Star, ShoppingCart, Search, Filter, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  product_id: string;
  product_name: string;
  selling_price: number;
  image_url?: string;
  stock_quantity: number;
  notes?: string;
}

export const Store: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, product_id, product_name, selling_price, image_url, stock_quantity, notes')
        .gt('stock_quantity', 0)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      setProducts(data || []);
      setFeaturedProducts(data?.slice(0, 4) || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Nouacer Telecom</h1>
                <p className="text-sm text-muted-foreground">أحسن الأسعار في الجزائر</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">
            <span className="gradient-text">تسوق معانا</span>
            <br />
            <span className="text-3xl">وخليك دايماً متصل!</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            أحدث الهواتف والإكسسوارات الإلكترونية بأفضل الأسعار في الجزائر. 
            جودة عالية، ضمان أكيد، وخدمة ممتازة!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="btn-gradient px-8 py-3 text-lg">
              🛍️ ابدأ التسوق
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
              📞 اتصل بنا
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold gradient-text mb-4">منتجاتنا المميزة</h3>
            <p className="text-muted-foreground text-lg">آخر الوصول والأكثر طلباً</p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="glass-card animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-6 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="glass-card hover-lift group cursor-pointer">
                  <div className="relative overflow-hidden rounded-t-lg">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.product_name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Phone className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 bg-success text-success-foreground">
                      متوفر
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-lg mb-2 line-clamp-2">{product.product_name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(product.selling_price)}
                      </span>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4" />
                      </div>
                    </div>
                    <Button className="w-full mt-3 btn-gradient">
                      أضف للسلة
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold gradient-text mb-4">آراء عملائنا</h3>
            <p className="text-muted-foreground text-lg">شوف إيش قالوا الناس عنا</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card p-6">
              <div className="flex items-center gap-1 text-yellow-500 mb-3">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
              <p className="text-muted-foreground mb-4">
                "والله خدمة ممتازة وأسعار معقولة. اشتريت تلفون وضمان كامل. ما شاء الله عليكم!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                <div>
                  <p className="font-semibold">أحمد بن علي</p>
                  <p className="text-sm text-muted-foreground">وهران</p>
                </div>
              </div>
            </Card>
            
            <Card className="glass-card p-6">
              <div className="flex items-center gap-1 text-yellow-500 mb-3">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
              <p className="text-muted-foreground mb-4">
                "تعامل راقي ومنتجات أصلية. صار لي سنة نشري منهم، ما خابوش ظني أبداً!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-secondary to-primary rounded-full"></div>
                <div>
                  <p className="font-semibold">فاطمة محمد</p>
                  <p className="text-sm text-muted-foreground">الجزائر العاصمة</p>
                </div>
              </div>
            </Card>
            
            <Card className="glass-card p-6">
              <div className="flex items-center gap-1 text-yellow-500 mb-3">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
              <p className="text-muted-foreground mb-4">
                "أفضل محل للإلكترونيات في المنطقة. سرعة في التوصيل وأسعار منافسة جداً!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary/80 to-secondary/80 rounded-full"></div>
                <div>
                  <p className="font-semibold">يوسف الحاج</p>
                  <p className="text-sm text-muted-foreground">قسنطينة</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold gradient-text mb-4">عروض خاصة</h3>
            <p className="text-muted-foreground text-lg">خصومات حصرية ولفترة محدودة</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-card overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white text-center">
                <h4 className="text-3xl font-bold mb-2">خصم 20%</h4>
                <p className="text-xl">على جميع الهواتف الذكية</p>
                <Badge className="bg-white text-primary mt-3">
                  🔥 عرض محدود
                </Badge>
              </div>
            </Card>
            
            <Card className="glass-card overflow-hidden">
              <div className="bg-gradient-to-r from-secondary to-primary p-8 text-white text-center">
                <h4 className="text-3xl font-bold mb-2">توصيل مجاني</h4>
                <p className="text-xl">لطلبات أكثر من 10,000 دج</p>
                <Badge className="bg-white text-secondary mt-3">
                  🚚 في كامل التراب الوطني
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <h4 className="text-xl font-bold gradient-text">Nouacer Telecom</h4>
              </div>
              <p className="text-muted-foreground">
                متجرك الأول للإلكترونيات والهواتف الذكية في الجزائر
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">روابط سريعة</h5>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary">الرئيسية</a></li>
                <li><a href="#" className="hover:text-primary">المنتجات</a></li>
                <li><a href="#" className="hover:text-primary">من نحن</a></li>
                <li><a href="#" className="hover:text-primary">اتصل بنا</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">الفئات</h5>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary">هواتف ذكية</a></li>
                <li><a href="#" className="hover:text-primary">إكسسوارات</a></li>
                <li><a href="#" className="hover:text-primary">إلكترونيات</a></li>
                <li><a href="#" className="hover:text-primary">قطع غيار</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">تواصل معنا</h5>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+213 555 123 456</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>الجزائر العاصمة، الجزائر</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Nouacer Telecom. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};