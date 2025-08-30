import React, { useState, useEffect } from 'react';
import { Phone, Search, Filter, ShoppingCart, Heart, Star, ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  product_id: string;
  product_name: string;
  selling_price: number;
  image_url?: string;
  stock_quantity: number;
  notes?: string;
}

export const StoreProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, priceFilter, sortBy]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, product_id, product_name, selling_price, image_url, stock_quantity, notes')
        .gt('stock_quantity', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products.filter(product =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(product => {
        const price = product.selling_price;
        switch (priceFilter) {
          case 'low': return price < 10000;
          case 'medium': return price >= 10000 && price < 50000;
          case 'high': return price >= 50000;
          default: return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.selling_price - b.selling_price;
        case 'price-high': return b.selling_price - a.selling_price;
        case 'name': return a.product_name.localeCompare(b.product_name);
        default: return 0;
      }
    });

    setFilteredProducts(filtered);
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
              <Link to="/store" className="text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Nouacer Telecom</h1>
                <p className="text-sm text-muted-foreground">منتجاتنا</p>
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

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold gradient-text mb-4">منتجاتنا</h2>
          <p className="text-muted-foreground text-lg">اكتشف مجموعتنا الكاملة من الهواتف والإكسسوارات</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن المنتجات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-enhanced rounded-xl text-right"
            />
          </div>
          
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-full lg:w-48 rounded-xl">
              <SelectValue placeholder="فلتر السعر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأسعار</SelectItem>
              <SelectItem value="low">أقل من 10,000 دج</SelectItem>
              <SelectItem value="medium">10,000 - 50,000 دج</SelectItem>
              <SelectItem value="high">أكثر من 50,000 دج</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-48 rounded-xl">
              <SelectValue placeholder="ترتيب حسب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">الاسم</SelectItem>
              <SelectItem value="price-low">السعر: من الأقل للأعلى</SelectItem>
              <SelectItem value="price-high">السعر: من الأعلى للأقل</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="glass-card animate-pulse">
                <div className="h-64 bg-muted rounded-t-lg"></div>
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-6 bg-muted rounded"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="glass-card hover-lift group cursor-pointer">
                  <div className="relative overflow-hidden rounded-t-lg">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.product_name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Phone className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className="absolute top-3 right-3 bg-success text-success-foreground">
                      متوفر
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-lg mb-2 line-clamp-2 text-right">
                      {product.product_name}
                    </h4>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4" />
                        <span className="text-sm text-muted-foreground ml-1">(24)</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        ID: {product.product_id}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(product.selling_price)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 btn-gradient">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        أضف للسلة
                      </Button>
                      <Button variant="outline" className="px-3">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <Card className="glass-card">
                <CardContent className="p-12 text-center">
                  <Phone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">لا توجد منتجات</h3>
                  <p className="text-muted-foreground">
                    لم نجد أي منتجات تطابق معايير البحث الخاصة بك
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Results Summary */}
        {!loading && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              عرض {filteredProducts.length} من {products.length} منتج
            </p>
          </div>
        )}
      </div>
    </div>
  );
};