import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Edit, Trash2, Phone, MapPin } from 'lucide-react';
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

interface Customer {
  id: string;
  customer_id: string;
  full_name: string;
  shop_name?: string;
  phone_number?: string;
  wilaya?: string;
  commune?: string;
  address_details?: string;
  location_url?: string;
  total_purchases: number;
  last_purchase_date?: string;
  notes?: string;
  created_at: string;
}

export const Customers: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    full_name: '',
    shop_name: '',
    phone_number: '',
    wilaya: '',
    commune: '',
    address_details: '',
    location_url: '',
    notes: ''
  });

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      toast({
        title: t.error,
        description: 'Failed to fetch customers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      toast({
        title: t.error,
        description: 'Customer name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const customerData = {
        customer_id: formData.customer_id || `CUST${Date.now()}`,
        full_name: formData.full_name,
        shop_name: formData.shop_name || null,
        phone_number: formData.phone_number || null,
        wilaya: formData.wilaya || null,
        commune: formData.commune || null,
        address_details: formData.address_details || null,
        location_url: formData.location_url || null,
        notes: formData.notes || null,
      };

      if (editingCustomer) {
        const { error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', editingCustomer.id);

        if (error) throw error;
        toast({ title: t.success, description: 'Customer updated successfully' });
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([customerData]);

        if (error) throw error;
        toast({ title: t.success, description: 'Customer added successfully' });
      }

      setDialogOpen(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      toast({
        title: t.error,
        description: 'Failed to save customer',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      customer_id: customer.customer_id,
      full_name: customer.full_name,
      shop_name: customer.shop_name || '',
      phone_number: customer.phone_number || '',
      wilaya: customer.wilaya || '',
      commune: customer.commune || '',
      address_details: customer.address_details || '',
      location_url: customer.location_url || '',
      notes: customer.notes || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: t.success, description: 'Customer deleted successfully' });
      fetchCustomers();
    } catch (error) {
      toast({
        title: t.error,
        description: 'Failed to delete customer',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      full_name: '',
      shop_name: '',
      phone_number: '',
      wilaya: '',
      commune: '',
      address_details: '',
      location_url: '',
      notes: ''
    });
    setEditingCustomer(null);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.wilaya?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold gradient-text">{t.customers}</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient gap-2" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              {t.add} {t.customerName}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? t.edit : t.add} {t.customerName}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_id">Customer ID</Label>
                  <Input
                    id="customer_id"
                    value={formData.customer_id}
                    onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div>
                  <Label htmlFor="full_name">{t.customerName} *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shop_name">{t.shopName}</Label>
                  <Input
                    id="shop_name"
                    value={formData.shop_name}
                    onChange={(e) => setFormData({...formData, shop_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone_number">{t.phoneNumber}</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wilaya">{t.wilaya}</Label>
                  <Input
                    id="wilaya"
                    value={formData.wilaya}
                    onChange={(e) => setFormData({...formData, wilaya: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="commune">{t.commune}</Label>
                  <Input
                    id="commune"
                    value={formData.commune}
                    onChange={(e) => setFormData({...formData, commune: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address_details">{t.address}</Label>
                <Input
                  id="address_details"
                  value={formData.address_details}
                  onChange={(e) => setFormData({...formData, address_details: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="location_url">{t.locationUrl}</Label>
                <Input
                  id="location_url"
                  value={formData.location_url}
                  onChange={(e) => setFormData({...formData, location_url: e.target.value})}
                  placeholder="Google Maps link or coordinates"
                />
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
            placeholder={`${t.search} ${t.customers.toLowerCase()}...`}
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

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="glass-card hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{customer.full_name}</CardTitle>
                  {customer.shop_name && (
                    <Badge variant="secondary" className="text-xs">
                      {customer.shop_name}
                    </Badge>
                  )}
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                {customer.phone_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone_number}</span>
                  </div>
                )}
                {(customer.wilaya || customer.commune) && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{[customer.wilaya, customer.commune].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Purchase Info */}
              <div className="space-y-2 border-t pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.totalPurchases}:</span>
                  <span className="font-medium">{formatCurrency(customer.total_purchases)}</span>
                </div>
                {customer.last_purchase_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.lastPurchase}:</span>
                    <span className="font-medium">
                      {new Date(customer.last_purchase_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(customer)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {t.edit}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(customer.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{filteredCustomers.length}</div>
            <div className="text-sm text-muted-foreground">Total Customers</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {formatCurrency(filteredCustomers.reduce((sum, c) => sum + c.total_purchases, 0))}
            </div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {filteredCustomers.filter(c => c.last_purchase_date && 
                new Date(c.last_purchase_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <div className="text-sm text-muted-foreground">Active (30 days)</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {filteredCustomers.length > 0 
                ? formatCurrency(filteredCustomers.reduce((sum, c) => sum + c.total_purchases, 0) / filteredCustomers.length)
                : formatCurrency(0)
              }
            </div>
            <div className="text-sm text-muted-foreground">Avg. Purchase</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};