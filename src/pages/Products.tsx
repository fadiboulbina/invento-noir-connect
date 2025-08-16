import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, Edit, Trash2, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ResellerPrice {
  id: string;
  reseller_name: string;
  reseller_price: number;
  created_at: string;
  updated_at: string;
}

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
  reseller_prices?: ResellerPrice[];
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
  const [resellerFormData, setResellerFormData] = useState({
    reseller_name: '',
    reseller_price: ''
  });
  const [addingReseller, setAddingReseller] = useState<string | null>(null);
  const [editingReseller, setEditingReseller] = useState<ResellerPrice | null>(null);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          reseller_prices:product_reseller_prices(*)
        `)
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

  const handleAddReseller = async (productId: string) => {
    if (!resellerFormData.reseller_name || !resellerFormData.reseller_price) {
      toast({
        title: t.error,
        description: 'Please fill all reseller fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('product_reseller_prices')
        .insert([{
          product_id: productId,
          reseller_name: resellerFormData.reseller_name,
          reseller_price: parseFloat(resellerFormData.reseller_price)
        }]);

      if (error) throw error;
      
      setResellerFormData({ reseller_name: '', reseller_price: '' });
      setAddingReseller(null);
      fetchProducts();
      toast({ title: t.success, description: 'Reseller price added successfully' });
    } catch (error) {
      toast({
        title: t.error,
        description: 'Failed to add reseller price',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReseller = async (resellerId: string) => {
    try {
      const { error } = await supabase
        .from('product_reseller_prices')
        .delete()
        .eq('id', resellerId);

      if (error) throw error;
      fetchProducts();
      toast({ title: t.success, description: 'Reseller price deleted successfully' });
    } catch (error) {
      toast({
        title: t.error,
        description: 'Failed to delete reseller price',
        variant: 'destructive',
      });
    }
  };

  const getPriceAnalysis = (product: Product) => {
    const resellerPrices = product.reseller_prices || [];
    if (resellerPrices.length === 0) return null;

    const prices = resellerPrices.map(rp => rp.reseller_price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    // Optimal price: slightly below lowest reseller price
    const optimalPrice = minPrice * 0.95;
    
    return {
      minPrice,
      maxPrice,
      avgPrice,
      optimalPrice,
      lowestReseller: resellerPrices.find(rp => rp.reseller_price === minPrice)?.reseller_name
    };
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-8">
          <div className="text-lg text-muted-foreground">{t.loading}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">{t.products}</h1>
          <p className="text-muted-foreground">Manage your product inventory with integrated price comparison</p>
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
            className="pl-10 input-enhanced rounded-xl"
          />
        </div>
        <Button variant="outline" className="gap-2 rounded-xl">
          <Filter className="h-4 w-4" />
          {t.filter}
        </Button>
      </div>

      {/* Products with Integrated Price Comparison */}
      <div className="space-y-6">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product.stock_quantity, product.low_stock_threshold);
          const profit = product.selling_price - product.buying_price;
          const profitMargin = ((profit / product.selling_price) * 100).toFixed(1);
          const priceAnalysis = getPriceAnalysis(product);
          
          return (
            <Card key={product.id} className="glass-card hover-lift rounded-xl shadow-soft">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{product.product_name}</CardTitle>
                    <Badge variant="secondary" className="text-sm rounded-lg">
                      ID: {product.product_id}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                </div>

                {/* Stock Status */}
                <div className="flex justify-between items-center">
                  <Badge className={stockStatus.color + ' rounded-lg'}>
                    {stockStatus.label}: {product.stock_quantity} units
                  </Badge>
                  {product.stock_quantity <= product.low_stock_threshold && (
                    <Badge variant="destructive" className="animate-pulse rounded-lg">
                      Low Stock Alert!
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Our Pricing Section */}
                <div className="rounded-xl border-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] p-4 shadow-soft">
                  <h4 className="font-semibold text-[hsl(var(--primary))] mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Our Pricing
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Buying Price:</span>
                      <div className="font-medium">{formatCurrency(product.buying_price)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Our Price:</span>
                      <div className="font-bold text-lg text-[hsl(var(--primary))]">{formatCurrency(product.selling_price)}</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-[hsl(var(--primary)/0.2)]">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Profit:</span>
                      <span className="font-semibold text-[hsl(var(--success))]">
                        {formatCurrency(profit)} ({profitMargin}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reseller Prices Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-foreground">Reseller Prices</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddingReseller(product.id)}
                      className="bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))] border-[hsl(var(--success)/0.2)] hover:bg-[hsl(var(--success)/0.2)] rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Reseller
                    </Button>
                  </div>

                  {/* Add Reseller Form */}
                  {addingReseller === product.id && (
                    <Card className="bg-muted/5 border-2 border-dashed rounded-xl">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Reseller name..."
                            value={resellerFormData.reseller_name}
                            onChange={(e) => setResellerFormData({
                              ...resellerFormData,
                              reseller_name: e.target.value
                            })}
                            className="rounded-xl border-muted-foreground/20"
                          />
                          <Input
                            type="number"
                            placeholder="Price..."
                            value={resellerFormData.reseller_price}
                            onChange={(e) => setResellerFormData({
                              ...resellerFormData,
                              reseller_price: e.target.value
                            })}
                            className="rounded-xl border-muted-foreground/20"
                          />
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => handleAddReseller(product.id)}
                            className="bg-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.9)] rounded-lg"
                          >
                            Add
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAddingReseller(null)}
                            className="text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.1)] rounded-lg"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Reseller Prices Table */}
                  {product.reseller_prices && product.reseller_prices.length > 0 ? (
                    <div className="rounded-xl border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/5">
                            <TableHead className="font-semibold">Reseller</TableHead>
                            <TableHead className="font-semibold">Price</TableHead>
                            <TableHead className="font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {product.reseller_prices
                            .sort((a, b) => a.reseller_price - b.reseller_price)
                            .map((reseller, index) => {
                              const isLowest = priceAnalysis && reseller.reseller_price === priceAnalysis.minPrice;
                              return (
                                <TableRow key={reseller.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/3'}>
                                  <TableCell className="font-medium">{reseller.reseller_name}</TableCell>
                                  <TableCell>
                                    <Badge 
                                      className={isLowest 
                                        ? 'bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))] border-[hsl(var(--success)/0.2)] rounded-lg' 
                                        : 'bg-muted/10 text-muted-foreground border-muted/20 rounded-lg'
                                      }
                                    >
                                      {formatCurrency(reseller.reseller_price)}
                                      {isLowest && ' (Lowest)'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteReseller(reseller.id)}
                                      className="text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.1)] rounded-lg"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground bg-muted/5 rounded-xl border-2 border-dashed">
                      No reseller prices added yet
                    </div>
                  )}
                </div>

                {/* Price Analysis Widget */}
                {priceAnalysis && (
                  <div className="rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 shadow-soft">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
                      💹 Price Analysis
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-yellow-700 dark:text-yellow-300">Lowest Price:</span>
                        <div className="font-bold text-[hsl(var(--success))]">{formatCurrency(priceAnalysis.minPrice)}</div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-400">
                          by {priceAnalysis.lowestReseller}
                        </div>
                      </div>
                      <div>
                        <span className="text-yellow-700 dark:text-yellow-300">Average Price:</span>
                        <div className="font-bold">{formatCurrency(priceAnalysis.avgPrice)}</div>
                      </div>
                      <div className="col-span-2">
                        <Badge className="bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700 rounded-lg">
                          💡 Optimal Price: {formatCurrency(priceAnalysis.optimalPrice)}
                          {product.selling_price <= priceAnalysis.optimalPrice && " (You're competitive!)"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 hover:bg-[hsl(var(--primary)/0.1)] hover:text-[hsl(var(--primary))] rounded-xl">
                    <Edit className="h-4 w-4 mr-2" />
                    {t.edit}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 hover:bg-orange-500/10 hover:text-orange-500 rounded-xl">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="glass-card rounded-xl">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No products found. Start by adding some products to your inventory.</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{filteredProducts.length}</div>
            <div className="text-sm text-muted-foreground">Total Products</div>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {filteredProducts.filter(p => p.stock_quantity <= p.low_stock_threshold).length}
            </div>
            <div className="text-sm text-muted-foreground">{t.lowStock}</div>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(filteredProducts.reduce((sum, p) => sum + (p.stock_quantity * p.selling_price), 0))}
            </div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </CardContent>
        </Card>
        <Card className="glass-card rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[hsl(var(--success))]">
              {formatCurrency(filteredProducts.reduce((sum, p) => sum + ((p.selling_price - p.buying_price) * p.stock_quantity), 0))}
            </div>
            <div className="text-sm text-muted-foreground">Potential Profit</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};