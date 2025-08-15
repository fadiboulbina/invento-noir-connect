import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Filter, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
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

interface Shipper {
  id: string;
  shipper_id: string;
  shipper_name: string;
  contact_person?: string;
  phone_number?: string;
  address?: string;
  wilaya?: string;
  commune?: string;
  notes?: string;
  created_at: string;
}

export const Shippers: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShipper, setEditingShipper] = useState<Shipper | null>(null);
  const [formData, setFormData] = useState({
    shipper_id: '',
    shipper_name: '',
    contact_person: '',
    phone_number: '',
    address: '',
    wilaya: '',
    commune: '',
    notes: ''
  });

  const fetchShippers = async () => {
    try {
      const { data, error } = await supabase
        .from('shippers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShippers(data || []);
    } catch (error) {
      toast({
        title: t.error,
        description: 'Failed to fetch suppliers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.shipper_name.trim()) {
      toast({
        title: t.error,
        description: 'Supplier name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const shipperData = {
        shipper_id: formData.shipper_id || `SHIP${Date.now()}`,
        shipper_name: formData.shipper_name,
        contact_person: formData.contact_person || null,
        phone_number: formData.phone_number || null,
        address: formData.address || null,
        wilaya: formData.wilaya || null,
        commune: formData.commune || null,
        notes: formData.notes || null,
      };

      if (editingShipper) {
        const { error } = await supabase
          .from('shippers')
          .update(shipperData)
          .eq('id', editingShipper.id);

        if (error) throw error;
        toast({ title: t.success, description: 'Supplier updated successfully' });
      } else {
        const { error } = await supabase
          .from('shippers')
          .insert([shipperData]);

        if (error) throw error;
        toast({ title: t.success, description: 'Supplier added successfully' });
      }

      setDialogOpen(false);
      resetForm();
      fetchShippers();
    } catch (error) {
      toast({
        title: t.error,
        description: 'Failed to save supplier',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (shipper: Shipper) => {
    setEditingShipper(shipper);
    setFormData({
      shipper_id: shipper.shipper_id,
      shipper_name: shipper.shipper_name,
      contact_person: shipper.contact_person || '',
      phone_number: shipper.phone_number || '',
      address: shipper.address || '',
      wilaya: shipper.wilaya || '',
      commune: shipper.commune || '',
      notes: shipper.notes || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shippers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: t.success, description: 'Supplier deleted successfully' });
      fetchShippers();
    } catch (error) {
      toast({
        title: t.error,
        description: 'Failed to delete supplier',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      shipper_id: '',
      shipper_name: '',
      contact_person: '',
      phone_number: '',
      address: '',
      wilaya: '',
      commune: '',
      notes: ''
    });
    setEditingShipper(null);
  };

  const filteredShippers = shippers.filter(shipper =>
    shipper.shipper_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipper.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipper.wilaya?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold gradient-text">{t.shippers}</h1>
          <p className="text-muted-foreground">Manage your supplier network</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient gap-2" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              {t.add} Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingShipper ? t.edit : t.add} Supplier
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipper_id">Supplier ID</Label>
                  <Input
                    id="shipper_id"
                    value={formData.shipper_id}
                    onChange={(e) => setFormData({...formData, shipper_id: e.target.value})}
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div>
                  <Label htmlFor="shipper_name">Company Name *</Label>
                  <Input
                    id="shipper_name"
                    value={formData.shipper_name}
                    onChange={(e) => setFormData({...formData, shipper_name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
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
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
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
            placeholder={`${t.search} suppliers...`}
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

      {/* Shippers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShippers.map((shipper) => (
          <Card key={shipper.id} className="glass-card hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{shipper.shipper_name}</CardTitle>
                  {shipper.contact_person && (
                    <Badge variant="secondary" className="text-xs">
                      {shipper.contact_person}
                    </Badge>
                  )}
                </div>
                <Truck className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                {shipper.phone_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{shipper.phone_number}</span>
                  </div>
                )}
                {shipper.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div>{shipper.address}</div>
                      {(shipper.wilaya || shipper.commune) && (
                        <div className="text-muted-foreground">
                          {[shipper.wilaya, shipper.commune].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {shipper.notes && (
                <div className="text-sm text-muted-foreground border-t pt-3">
                  <p className="line-clamp-2">{shipper.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(shipper)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {t.edit}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(shipper.id)}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{filteredShippers.length}</div>
            <div className="text-sm text-muted-foreground">Total Suppliers</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {filteredShippers.filter(s => s.phone_number).length}
            </div>
            <div className="text-sm text-muted-foreground">With Contact Info</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {new Set(filteredShippers.map(s => s.wilaya).filter(Boolean)).size}
            </div>
            <div className="text-sm text-muted-foreground">Wilayas Covered</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};