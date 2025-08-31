import React, { useState } from 'react';
import { ArrowLeft, Phone, CreditCard, MapPin, User, Mail, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OrderData {
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    wilaya: string;
    commune: string;
    notes?: string;
  };
  paymentMethod: 'cod' | 'card' | 'bank';
  shippingMethod: 'standard' | 'express';
}

export const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderData>({
    customerInfo: {
      fullName: '',
      email: user?.email || '',
      phone: '',
      address: '',
      wilaya: '',
      commune: '',
      notes: '',
    },
    paymentMethod: 'cod',
    shippingMethod: 'standard',
  });

  const shippingCost = orderData.shippingMethod === 'express' ? 1000 : 500;
  const finalTotal = totalPrice + shippingCost;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleInputChange = (field: keyof OrderData['customerInfo'], value: string) => {
    setOrderData(prev => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        [field]: value,
      },
    }));
  };

  const validateForm = () => {
    const { customerInfo } = orderData;
    if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.address || !customerInfo.wilaya || !customerInfo.commune) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm() || items.length === 0) return;

    setLoading(true);
    try {
      // Create order in database
      const orderId = `ORD-${Date.now()}`;
      
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          order_id: orderId,
          total_amount: finalTotal,
          payment_status: 'pending',
          delivery_status: 'pending',
          notes: `العميل: ${orderData.customerInfo.fullName}\nالهاتف: ${orderData.customerInfo.phone}\nالعنوان: ${orderData.customerInfo.address}, ${orderData.customerInfo.commune}, ${orderData.customerInfo.wilaya}\nطريقة الدفع: ${orderData.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'كارت بنكي'}\nطريقة الشحن: ${orderData.shippingMethod === 'express' ? 'شحن سريع' : 'شحن عادي'}\nملاحظات: ${orderData.customerInfo.notes || 'لا توجد ملاحظات'}`,
        });

      if (orderError) throw orderError;

      // Clear cart and redirect
      clearCart();
      
      toast({
        title: "تم إرسال الطلب بنجاح!",
        description: `رقم الطلب: ${orderId}. سنتصل بك قريباً لتأكيد الطلب.`,
      });

      navigate('/store/order-success');
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: "خطأ في إرسال الطلب",
        description: "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">السلة فارغة</h2>
            <p className="text-muted-foreground mb-6">لا يمكنك إتمام الطلب بسلة فارغة</p>
            <Link to="/store/products">
              <Button className="btn-gradient">تصفح المنتجات</Button>
            </Link>
          </div>
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
            <Link to="/store" className="text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <Phone className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-bold gradient-text">إتمام الطلب</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2">
                  <User className="h-5 w-5" />
                  معلومات الطلب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">الاسم الكامل *</Label>
                    <Input
                      id="fullName"
                      value={orderData.customerInfo.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="input-enhanced text-right"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={orderData.customerInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="input-enhanced text-right"
                      placeholder="0555 123 456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={orderData.customerInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="input-enhanced text-right"
                      placeholder="example@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wilaya">الولاية *</Label>
                    <Select value={orderData.customerInfo.wilaya} onValueChange={(value) => handleInputChange('wilaya', value)}>
                      <SelectTrigger className="input-enhanced">
                        <SelectValue placeholder="اختر الولاية" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alger">الجزائر</SelectItem>
                        <SelectItem value="oran">وهران</SelectItem>
                        <SelectItem value="constantine">قسنطينة</SelectItem>
                        <SelectItem value="annaba">عنابة</SelectItem>
                        <SelectItem value="blida">البليدة</SelectItem>
                        <SelectItem value="setif">سطيف</SelectItem>
                        <SelectItem value="sidi-bel-abbes">سيدي بلعباس</SelectItem>
                        <SelectItem value="biskra">بسكرة</SelectItem>
                        <SelectItem value="tebessa">تبسة</SelectItem>
                        <SelectItem value="bechar">بشار</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commune">البلدية *</Label>
                    <Input
                      id="commune"
                      value={orderData.customerInfo.commune}
                      onChange={(e) => handleInputChange('commune', e.target.value)}
                      className="input-enhanced text-right"
                      placeholder="أدخل اسم البلدية"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان التفصيلي *</Label>
                  <Textarea
                    id="address"
                    value={orderData.customerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="input-enhanced text-right min-h-[80px]"
                    placeholder="أدخل عنوانك التفصيلي مع ذكر النقاط المرجعية"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات إضافية</Label>
                  <Textarea
                    id="notes"
                    value={orderData.customerInfo.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="input-enhanced text-right"
                    placeholder="أي ملاحظات خاصة بالطلب (اختياري)"
                  />
                </div>

                {/* Delivery Options */}
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    طريقة الشحن
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card 
                      className={`cursor-pointer transition-all ${orderData.shippingMethod === 'standard' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                      onClick={() => setOrderData(prev => ({ ...prev, shippingMethod: 'standard' }))}
                    >
                      <CardContent className="p-4 text-center">
                        <Truck className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <h4 className="font-semibold">شحن عادي</h4>
                        <p className="text-sm text-muted-foreground mb-2">3-5 أيام عمل</p>
                        <Badge variant="secondary">{formatCurrency(500)}</Badge>
                      </CardContent>
                    </Card>
                    <Card 
                      className={`cursor-pointer transition-all ${orderData.shippingMethod === 'express' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                      onClick={() => setOrderData(prev => ({ ...prev, shippingMethod: 'express' }))}
                    >
                      <CardContent className="p-4 text-center">
                        <Truck className="h-8 w-8 mx-auto mb-2 text-secondary" />
                        <h4 className="font-semibold">شحن سريع</h4>
                        <p className="text-sm text-muted-foreground mb-2">24-48 ساعة</p>
                        <Badge className="bg-secondary text-secondary-foreground">{formatCurrency(1000)}</Badge>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Payment Options */}
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    طريقة الدفع
                  </h3>
                  <Tabs value={orderData.paymentMethod} onValueChange={(value) => setOrderData(prev => ({ ...prev, paymentMethod: value as any }))}>
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="cod">الدفع عند الاستلام</TabsTrigger>
                      <TabsTrigger value="card">كارت بنكي</TabsTrigger>
                    </TabsList>
                    <TabsContent value="cod" className="mt-4">
                      <Card className="glass-card p-4">
                        <div className="text-center">
                          <Shield className="h-12 w-12 text-success mx-auto mb-3" />
                          <h4 className="font-semibold mb-2">الدفع عند الاستلام</h4>
                          <p className="text-sm text-muted-foreground">
                            ادفع نقداً عند استلام المنتج. آمن وموثوق.
                          </p>
                        </div>
                      </Card>
                    </TabsContent>
                    <TabsContent value="card" className="mt-4">
                      <Card className="glass-card p-4">
                        <div className="text-center">
                          <CreditCard className="h-12 w-12 text-primary mx-auto mb-3" />
                          <h4 className="font-semibold mb-2">الدفع الإلكتروني</h4>
                          <p className="text-sm text-muted-foreground">
                            ادفع بأمان باستخدام الكارت البنكي (قريباً)
                          </p>
                          <Badge variant="outline" className="mt-2">قريباً</Badge>
                        </div>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="glass-card sticky top-24">
              <CardHeader>
                <CardTitle className="text-right">ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-2 text-right">
                          {item.product_name}
                        </h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-primary font-semibold">
                            {formatCurrency(item.selling_price * item.quantity)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            الكمية: {item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الشحن:</span>
                    <span>{formatCurrency(shippingCost)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>المجموع الكلي:</span>
                    <span className="text-primary">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitOrder}
                  disabled={loading || orderData.paymentMethod === 'card'}
                  className="w-full btn-gradient text-lg py-6"
                  size="lg"
                >
                  {loading ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  بالضغط على "تأكيد الطلب" أنت توافق على شروط الخدمة
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};