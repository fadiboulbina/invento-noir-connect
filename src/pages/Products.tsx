import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  product_id: string;
  product_name: string;
  category_id?: string;
  buying_price: number;
  selling_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  notes?: string;
  image_url?: string;
}

interface Category {
  id: string;
  name: string;
}

export const Products: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    product_id: '',
    product_name: '',
    category_id: '',
    buying_price: '',
    selling_price: '',
    stock_quantity: '',
    low_stock_threshold: '10',
    notes: ''
  });

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast({
        title: t.error,
        description: 'Failed to fetch products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock <= threshold) return { label: t.lowStock, color: 'bg-destructive/10 text-destructive border-destructive/20' };
    if (stock <= threshold * 2) return { label: t.warning, color: 'bg-warning/10 text-warning border-warning/20' };
    return { label: 'In Stock', color: 'bg-success/10 text-success border-success/20' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">{t.products}</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button className="btn-gradient gap-2">
          <Plus className="h-4 w-4" />
          {t.add} {t.productName}
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`${t.search} ${t.products.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-enhanced"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          {t.filter}
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product.stock_quantity, product.low_stock_threshold);
          const profit = product.selling_price - product.buying_price;
          const profitMargin = ((profit / product.selling_price) * 100).toFixed(1);
          
          return (
            <Card key={product.id} className="glass-card hover-lift">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{product.product_name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {product.product_id}
                    </Badge>
                  </div>
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.buyingPrice}:</span>
                    <span className="font-medium">{formatCurrency(product.buying_price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.sellingPrice}:</span>
                    <span className="font-medium">{formatCurrency(product.selling_price)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-muted-foreground">Profit:</span>
                    <span className="font-semibold text-success">
                      {formatCurrency(profit)} ({profitMargin}%)
                    </span>
                  </div>
                </div>

                {/* Stock */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t.stockQuantity}:</span>
                    <Badge className={stockStatus.color}>
                      {stockStatus.label}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-foreground">{product.stock_quantity}</span>
                    <span className="text-sm text-muted-foreground ml-1">units</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    {t.edit}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{filteredProducts.length}</div>
            <div className="text-sm text-muted-foreground">Total Products</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {filteredProducts.filter(p => p.stock_quantity <= p.low_stock_threshold).length}
            </div>
            <div className="text-sm text-muted-foreground">{t.lowStock}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(filteredProducts.reduce((sum, p) => sum + (p.stock_quantity * p.selling_price), 0))}
            </div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {formatCurrency(filteredProducts.reduce((sum, p) => sum + ((p.selling_price - p.buying_price) * p.stock_quantity), 0))}
            </div>
            <div className="text-sm text-muted-foreground">Potential Profit</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};