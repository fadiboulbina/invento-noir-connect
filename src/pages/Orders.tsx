import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Search, Filter, Edit, Trash2, FileText, Printer, Download } from 'lucide-react';
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

interface Order {
  id: string;
  order_id: string;
  customer_id?: string;
  order_date: string;
  total_amount: number;
  payment_status: string;
  delivery_status: string;
  notes?: string;
  customer?: {
    full_name: string;
    shop_name?: string;
  };
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  product_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: {
    product_name: string;
  };
}

interface Customer {
  id: string;
  full_name: string;
  shop_name?: string;
}

interface Product {
  id: string;
  product_name: string;
  selling_price: number;
}

export const Orders: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    order_id: '',
    customer_id: '',
    payment_status: 'pending',
    delivery_status: 'pending',
    notes: ''
  });
  const [orderItems, setOrderItems] = useState<{product_id: string; quantity: number; unit_price: number}[]>([
    { product_id: '', quantity: 1, unit_price: 0 }
  ]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers:customer_id (full_name, shop_name),
          order_items (
            *,
            products:product_id (product_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      toast({
        title: t.error,
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, full_name, shop_name')
        .order('full_name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, product_name, selling_price')
        .order('product_name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();
  }, []);

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id || orderItems.length === 0 || !orderItems[0].product_id) {
      toast({
        title: t.error,
        description: 'Customer and at least one product are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const orderData = {
        order_id: formData.order_id || `ORD${Date.now()}`,
        customer_id: formData.customer_id,
        payment_status: formData.payment_status,
        delivery_status: formData.delivery_status,
        total_amount: calculateTotal(),
        notes: formData.notes || null,
      };

      if (editingOrder) {
        const { error } = await supabase
          .from('orders')
          .update(orderData)
          .eq('id', editingOrder.id);

        if (error) throw error;

        // Delete existing order items
        await supabase
          .from('order_items')
          .delete()
          .eq('order_id', editingOrder.id);

        // Insert new order items
        const itemsData = orderItems
          .filter(item => item.product_id && item.quantity > 0)
          .map(item => ({
            order_id: editingOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.quantity * item.unit_price
          }));

        await supabase.from('order_items').insert(itemsData);

        toast({ title: t.success, description: 'Order updated successfully' });
      } else {
        const { data: newOrder, error } = await supabase
          .from('orders')
          .insert([orderData])
          .select()
          .single();

        if (error) throw error;

        // Insert order items
        const itemsData = orderItems
          .filter(item => item.product_id && item.quantity > 0)
          .map(item => ({
            order_id: newOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.quantity * item.unit_price
          }));

        await supabase.from('order_items').insert(itemsData);

        toast({ title: t.success, description: 'Order created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      fetchOrders();
    } catch (error) {
      toast({
        title: t.error,
        description: 'Failed to save order',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      order_id: order.order_id,
      customer_id: order.customer_id || '',
      payment_status: order.payment_status,
      delivery_status: order.delivery_status,
      notes: order.notes || ''
    });
    
    if (order.order_items && order.order_items.length > 0) {
      setOrderItems(order.order_items.map(item => ({
        product_id: item.product_id || '',
        quantity: item.quantity,
        unit_price: item.unit_price
      })));
    } else {
      setOrderItems([{ product_id: '', quantity: 1, unit_price: 0 }]);
    }
    
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete order items first
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);

      // Delete order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: t.success, description: 'Order deleted successfully' });
      fetchOrders();
    } catch (error) {
      toast({
        title: t.error,
        description: 'Failed to delete order',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      order_id: '',
      customer_id: '',
      payment_status: 'pending',
      delivery_status: 'pending',
      notes: ''
    });
    setOrderItems([{ product_id: '', quantity: 1, unit_price: 0 }]);
    setEditingOrder(null);
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1, unit_price: 0 }]);
  };

  const removeOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-update unit price when product is selected
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        updated[index].unit_price = product.selling_price;
      }
    }
    
    setOrderItems(updated);
  };

  const getStatusBadge = (status: string, type: 'payment' | 'delivery') => {
    const colors = {
      payment: {
        paid: 'bg-success/10 text-success border-success/20',
        unpaid: 'bg-destructive/10 text-destructive border-destructive/20',
        pending: 'bg-warning/10 text-warning border-warning/20'
      },
      delivery: {
        delivered: 'bg-success/10 text-success border-success/20',
        shipping: 'bg-primary/10 text-primary border-primary/20',
        pending: 'bg-warning/10 text-warning border-warning/20',
        cancelled: 'bg-destructive/10 text-destructive border-destructive/20'
      }
    };

    return colors[type][status as keyof typeof colors[typeof type]] || 'bg-muted/10 text-muted-foreground border-muted/20';
  };

  const filteredOrders = orders.filter(order =>
    order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.shop_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount);
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
          <h1 className="text-3xl font-bold gradient-text">{t.orders}</h1>
          <p className="text-muted-foreground">Manage customer orders and sales</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient gap-2" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              {t.add} Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOrder ? t.edit : t.add} Order
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="order_id">Order ID</Label>
                  <Input
                    id="order_id"
                    value={formData.order_id}
                    onChange={(e) => setFormData({...formData, order_id: e.target.value})}
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_id">Customer *</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => setFormData({...formData, customer_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.full_name} {customer.shop_name ? `(${customer.shop_name})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Order Items</Label>
                  <Button type="button" onClick={addOrderItem} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                
                {orderItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Label>Product</Label>
                      <Select
                        value={item.product_id}
                        onValueChange={(value) => updateOrderItem(index, 'product_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.product_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateOrderItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Total</Label>
                      <div className="text-sm font-medium p-2">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOrderItem(index)}
                        disabled={orderItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="text-right font-semibold text-lg">
                  Total: {formatCurrency(calculateTotal())}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_status">{t.paymentStatus}</Label>
                  <Select
                    value={formData.payment_status}
                    onValueChange={(value) => setFormData({...formData, payment_status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t.pending}</SelectItem>
                      <SelectItem value="paid">{t.paid}</SelectItem>
                      <SelectItem value="unpaid">{t.unpaid}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="delivery_status">{t.deliveryStatus}</Label>
                  <Select
                    value={formData.delivery_status}
                    onValueChange={(value) => setFormData({...formData, delivery_status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t.pending}</SelectItem>
                      <SelectItem value="shipping">{t.shipping}</SelectItem>
                      <SelectItem value="delivered">{t.delivered}</SelectItem>
                      <SelectItem value="cancelled">{t.cancelled}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">{t.notes}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
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
            placeholder={`${t.search} ${t.orders.toLowerCase()}...`}
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

      {/* Orders Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer?.full_name}</div>
                      {order.customer?.shop_name && (
                        <div className="text-sm text-muted-foreground">{order.customer.shop_name}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(order.payment_status, 'payment')}>
                      {order.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(order.delivery_status, 'delivery')}>
                      {order.delivery_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(order)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(order.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{filteredOrders.length}</div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {formatCurrency(filteredOrders.reduce((sum, o) => sum + o.total_amount, 0))}
            </div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {filteredOrders.filter(o => o.payment_status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">{t.pendingOrders}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {filteredOrders.filter(o => o.delivery_status === 'delivered').length}
            </div>
            <div className="text-sm text-muted-foreground">Delivered</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};