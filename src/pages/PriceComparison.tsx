import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Search, Filter, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PriceComparison {
  id: string;
  product_id: string;
  shipper_id: string;
  price: number;
  currency: string;
  last_updated: string;
  product?: {
    product_name: string;
    product_id: string;
  };
  shipper?: {
    shipper_name: string;
  };
}

interface Product {
  id: string;
  product_name: string;
  product_id: string;
}

interface Shipper {
  id: string;
  shipper_name: string;
}

interface ProductPriceData {
  product: Product;
  prices: {
    shipper: Shipper;
    price: number;
    last_updated: string;
    comparisonId: string;
  }[];
  lowestPrice: number;
  highestPrice: number;
}

export const PriceComparison: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [comparisons, setComparisons] = useState<PriceComparison[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingComparison, setEditingComparison] = useState<PriceComparison | null>(null);
  const [formData, setFormData] = useState({
    product_id: '',
    shipper_id: '',
    price: '',
    currency: 'DZD'
  });

  const fetchComparisons = async () => {
    try {
      const { data, error } = await supabase
        .from('product_price_comparisons')
        .select(`
          *,
          products:product_id (product_name, product_id),
          shippers:shipper_id (shipper_name)
        `)
        .order('last_updated', { ascending: false });

      if (error) throw error;
      setComparisons(data || []);
    } catch (error) {
      toast({
        title: t.error,
        description: 'Failed to fetch price comparisons',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, product_name, product_id')
        .order('product_name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchShippers = async () => {
    try {
      const { data, error } = await supabase
        .from('shippers')
        .select('id, shipper_name')
        .order('shipper_name');

      if (error) throw error;
      setShippers(data || []);
    } catch (error) {
      console.error('Failed to fetch shippers:', error);
    }
  };

  useEffect(() => {
    fetchComparisons();
    fetchProducts();
    fetchShippers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.product_id || !formData.shipper_id || !formData.price) {
      toast({
        title: t.error,
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const comparisonData = {
        product_id: formData.product_id,
        shipper_id: formData.shipper_id,
        price: parseFloat(formData.price),
        currency: formData.currency,
        last_updated: new Date().toISOString(),
      };

      if (editingComparison) {
        const { error } = await supabase
          .from('product_price_comparisons')
          .update(comparisonData)
          .eq('id', editingComparison.id);

        if (error) throw error;
        toast({ title: t.success, description: 'Price comparison updated successfully' });
      } else {
        const { error } = await supabase
          .from('product_price_comparisons')
          .insert([comparisonData]);

        if (error) throw error;
        toast({ title: t.success, description: 'Price comparison added successfully' });
      }

      setDialogOpen(false);
      resetForm();
      fetchComparisons();
    } catch (error) {
      toast({
        title: t.error,
        description: 'Failed to save price comparison',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (comparison: PriceComparison) => {
    setEditingComparison(comparison);
    setFormData({
      product_id: comparison.product_id,
      shipper_id: comparison.shipper_id,
      price: comparison.price.toString(),
      currency: comparison.currency
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('product_price_comparisons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: t.success, description: 'Price comparison deleted successfully' });
      fetchComparisons();
    } catch (error) {
      toast({
        title: t.error,
        description: 'Failed to delete price comparison',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      shipper_id: '',
      price: '',
      currency: 'DZD'
    });
    setEditingComparison(null);
  };

  // Group comparisons by product
  const groupedData: ProductPriceData[] = products
    .map(product => {
      const productComparisons = comparisons.filter(c => c.product_id === product.id);
      if (productComparisons.length === 0) return null;

      const prices = productComparisons.map(c => ({
        shipper: shippers.find(s => s.id === c.shipper_id)!,
        price: c.price,
        last_updated: c.last_updated,
        comparisonId: c.id
      })).filter(p => p.shipper);

      if (prices.length === 0) return null;

      const priceValues = prices.map(p => p.price);
      return {
        product,
        prices,
        lowestPrice: Math.min(...priceValues),
        highestPrice: Math.max(...priceValues)
      };
    })
    .filter(Boolean) as ProductPriceData[];

  const filteredData = groupedData.filter(data =>
    data.product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    data.product.product_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number, currency = 'DZD') => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPriceBadgeColor = (price: number, lowestPrice: number, highestPrice: number) => {
    if (price === lowestPrice) return 'bg-success/10 text-success border-success/20';
    if (price === highestPrice) return 'bg-destructive/10 text-destructive border-destructive/20';
    return 'bg-muted/10 text-muted-foreground border-muted/20';
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
          <h1 className="text-3xl font-bold gradient-text">{t.priceComparison}</h1>
          <p className="text-muted-foreground">Compare supplier prices across products</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient gap-2" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              Add Price
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingComparison ? t.edit : t.add} Price Comparison
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="product_id">Product *</Label>
                <Select
                  value={formData.product_id}
                  onValueChange={(value) => setFormData({...formData, product_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.product_name} ({product.product_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="shipper_id">Supplier *</Label>
                <Select
                  value={formData.shipper_id}
                  onValueChange={(value) => setFormData({...formData, shipper_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {shippers.map((shipper) => (
                      <SelectItem key={shipper.id} value={shipper.id}>
                        {shipper.shipper_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({...formData, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DZD">DZD</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {t.cancel}
                </Button>
                <Button type="submit">{t.save}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
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

      {/* Price Comparison Cards */}
      <div className="space-y-6">
        {filteredData.map((data) => (
          <Card key={data.product.id} className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{data.product.product_name}</CardTitle>
                  <p className="text-sm text-muted-foreground">ID: {data.product.product_id}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Price Range</div>
                  <div className="font-semibold">
                    {formatCurrency(data.lowestPrice)} - {formatCurrency(data.highestPrice)}
                  </div>
                  <div className="text-sm text-success">
                    Save: {formatCurrency(data.highestPrice - data.lowestPrice)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.prices
                    .sort((a, b) => a.price - b.price)
                    .map((priceInfo) => {
                      const comparison = comparisons.find(c => c.id === priceInfo.comparisonId);
                      return (
                        <TableRow key={priceInfo.comparisonId}>
                          <TableCell className="font-medium">
                            {priceInfo.shipper.shipper_name}
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriceBadgeColor(priceInfo.price, data.lowestPrice, data.highestPrice)}>
                              {formatCurrency(priceInfo.price)}
                              {priceInfo.price === data.lowestPrice && ' (Best)'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(priceInfo.last_updated).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => comparison && handleEdit(comparison)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(priceInfo.comparisonId)}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredData.length === 0 && (
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No price comparisons found. Add some products and suppliers to get started.</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{filteredData.length}</div>
            <div className="text-sm text-muted-foreground">Products Compared</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{comparisons.length}</div>
            <div className="text-sm text-muted-foreground">Total Price Points</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {filteredData.length > 0 
                ? formatCurrency(filteredData.reduce((sum, d) => sum + (d.highestPrice - d.lowestPrice), 0) / filteredData.length)
                : formatCurrency(0)
              }
            </div>
            <div className="text-sm text-muted-foreground">Avg. Savings</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {new Set(shippers.map(s => s.id)).size}
            </div>
            <div className="text-sm text-muted-foreground">Active Suppliers</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};