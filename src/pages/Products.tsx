import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, Edit, Trash2, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  reseller_prices?: ResellerPrice[];
}

interface ResellerPrice {
  id: string;
  reseller_name: string;
  reseller_price: number;
  created_at: string;
  updated_at: string;
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
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [resellerPrices, setResellerPrices] = useState<{ name: string; price: string }[]>([]);
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
        .select(`
          *,
          product_reseller_prices (
            id,
            reseller_name,
            reseller_price,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const productsWithPrices = (data || []).map(product => ({
        ...product,
        reseller_prices: product.product_reseller_prices || []
      }));
      
      setProducts(productsWithPrices);
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

  const getOptimalPrice = (ourPrice: number, resellerPrices: ResellerPrice[]) => {
    if (!resellerPrices || resellerPrices.length === 0) return ourPrice;
    const lowestResellerPrice = Math.min(...resellerPrices.map(r => r.reseller_price));
    return Math.max(lowestResellerPrice - 1, ourPrice * 0.9); // Slightly below lowest reseller or 10% off our price
  };

  const getPriceStats = (resellerPrices: ResellerPrice[]) => {
    if (!resellerPrices || resellerPrices.length === 0) return null;
    const prices = resellerPrices.map(r => r.reseller_price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((sum, price) => sum + price, 0) / prices.length
    };
  };

  const handleManagePrices = (product: Product) => {
    setSelectedProduct(product);
    setResellerPrices(
      product.reseller_prices?.map(rp => ({ name: rp.reseller_name, price: rp.reseller_price.toString() })) || []
    );
    setPriceDialogOpen(true);
  };

  const addResellerRow = () => {
    setResellerPrices([...resellerPrices, { name: '', price: '' }]);
  };

  const removeResellerRow = (index: number) => {
    setResellerPrices(resellerPrices.filter((_, i) => i !== index));
  };

  const updateResellerPrice = (index: number, field: 'name' | 'price', value: string) => {
    const updated = [...resellerPrices];
    updated[index][field] = value;
    setResellerPrices(updated);
  };

  const saveResellerPrices = async () => {
    if (!selectedProduct) return;

    try {
      // Delete existing reseller prices
      await supabase
        .from('product_reseller_prices')
        .delete()
        .eq('product_id', selectedProduct.id);

      // Insert new reseller prices
      const validPrices = resellerPrices.filter(rp => rp.name.trim() && rp.price.trim());
      if (validPrices.length > 0) {
        const { error } = await supabase
          .from('product_reseller_prices')
          .insert(
            validPrices.map(rp => ({
              product_id: selectedProduct.id,
              reseller_name: rp.name.trim(),
              reseller_price: parseFloat(rp.price)
            }))
          );

        if (error) throw error;
      }

      toast({ title: t.success, description: 'Reseller prices updated successfully' });
      setPriceDialogOpen(false);
      fetchProducts();
    } catch (error) {
      toast({
        title: t.error,
        description: 'Failed to update reseller prices',
        variant: 'destructive',
      });
    }
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

                {/* Price Comparison */}
                {product.reseller_prices && product.reseller_prices.length > 0 && (
                  <div className="space-y-2 border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Price Analysis</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleManagePrices(product)}
                        className="text-xs"
                      >
                        Manage
                      </Button>
                    </div>
                    {(() => {
                      const stats = getPriceStats(product.reseller_prices!);
                      const optimal = getOptimalPrice(product.selling_price, product.reseller_prices!);
                      return stats ? (
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Lowest competitor:</span>
                            <Badge className="bg-success/10 text-success border-success/20 text-xs">
                              {formatCurrency(stats.min)}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-600">Our price:</span>
                            <span className="font-medium text-blue-600">{formatCurrency(product.selling_price)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Optimal price:</span>
                            <Badge className="bg-warning/10 text-warning border-warning/20 text-xs">
                              {formatCurrency(optimal)} Optimal
                            </Badge>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    {t.edit}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleManagePrices(product)}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Prices
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

      {/* Price Management Dialog */}
      <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Manage Reseller Prices - {selectedProduct?.product_name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Current Product Info */}
            <div className="bg-muted/20 p-4 rounded-lg border-2 border-blue-200">
              <h3 className="font-semibold text-blue-600 mb-2">Our Product</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Product ID:</span>
                  <span className="ml-2 font-medium">{selectedProduct?.product_id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Our Price:</span>
                  <span className="ml-2 font-bold text-blue-600">
                    {selectedProduct && formatCurrency(selectedProduct.selling_price)}
                  </span>
                </div>
              </div>
            </div>

            {/* Reseller Prices */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Reseller Prices</h3>
                <Button 
                  onClick={addResellerRow} 
                  variant="outline" 
                  size="sm"
                  className="bg-success hover:bg-success/80 text-white border-success"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Reseller
                </Button>
              </div>

              {resellerPrices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No reseller prices yet. Add some to compare!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resellerPrices.map((reseller, index) => (
                    <div key={index} className="flex gap-3 p-3 border rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                      <div className="flex-1">
                        <Input
                          placeholder="Reseller name (e.g., Amazon, eBay)"
                          value={reseller.name}
                          onChange={(e) => updateResellerPrice(index, 'name', e.target.value)}
                          className="border-neutral-300 focus:border-blue-500"
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          placeholder="Price"
                          value={reseller.price}
                          onChange={(e) => updateResellerPrice(index, 'price', e.target.value)}
                          className="border-neutral-300 focus:border-blue-500"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeResellerRow(index)}
                        className="bg-destructive hover:bg-destructive/80 text-white border-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Analysis */}
            {resellerPrices.filter(rp => rp.name && rp.price).length > 0 && selectedProduct && (
              <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
                <h3 className="font-semibold text-warning mb-3">Price Analysis</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {(() => {
                    const validPrices = resellerPrices
                      .filter(rp => rp.name.trim() && rp.price.trim())
                      .map(rp => parseFloat(rp.price))
                      .filter(price => !isNaN(price));
                    
                    if (validPrices.length === 0) return null;
                    
                    const min = Math.min(...validPrices);
                    const max = Math.max(...validPrices);
                    const avg = validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length;
                    const optimal = Math.max(min - 1, selectedProduct.selling_price * 0.9);
                    
                    return (
                      <>
                        <div className="text-center">
                          <div className="text-muted-foreground">Lowest</div>
                          <div className="font-bold text-success">{formatCurrency(min)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Average</div>
                          <div className="font-bold">{formatCurrency(avg)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground">Optimal Price</div>
                          <div className="font-bold text-warning">{formatCurrency(optimal)}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setPriceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveResellerPrices} className="bg-blue-600 hover:bg-blue-700">
              Save Prices
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};