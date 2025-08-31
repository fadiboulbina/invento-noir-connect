import React from 'react';
import { CheckCircle, Phone, Home, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export const OrderSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <Phone className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-bold gradient-text">Nouacer Telecom</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <CheckCircle className="h-24 w-24 text-success mx-auto mb-4" />
            <h1 className="text-4xl font-bold gradient-text mb-4">
              تم إرسال طلبك بنجاح!
            </h1>
            <p className="text-xl text-muted-foreground">
              شكراً لك على ثقتك في Nouacer Telecom
            </p>
          </div>

          {/* Order Details */}
          <Card className="glass-card mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6">ماذا يحدث الآن؟</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 text-right">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">مراجعة الطلب</h3>
                    <p className="text-muted-foreground text-sm">
                      سيقوم فريقنا بمراجعة طلبك والتأكد من توفر المنتجات
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 text-right">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">تأكيد الطلب</h3>
                    <p className="text-muted-foreground text-sm">
                      سنتصل بك خلال ساعة لتأكيد الطلب وتفاصيل الشحن
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 text-right">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">التحضير والشحن</h3>
                    <p className="text-muted-foreground text-sm">
                      سنحضر طلبك بعناية ونرسله إليك في الوقت المحدد
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 text-right">
                  <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-success font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">الاستلام</h3>
                    <p className="text-muted-foreground text-sm">
                      استلم طلبك واستمتع بمنتجاتك الجديدة!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="glass-card mb-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">معلومات الاتصال</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 justify-center">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+213 555 123 456</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <span>WhatsApp: +213 555 123 456</span>
                </div>
              </div>
              <p className="text-muted-foreground mt-3">
                إذا كان لديك أي استفسار، لا تتردد في الاتصال بنا
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/store">
              <Button className="btn-gradient px-8 py-3">
                <Home className="h-4 w-4 mr-2" />
                العودة للرئيسية
              </Button>
            </Link>
            <Link to="/store/products">
              <Button variant="outline" className="px-8 py-3">
                تصفح المزيد من المنتجات
              </Button>
            </Link>
          </div>

          {/* Footer Note */}
          <div className="mt-12 p-6 bg-muted/30 rounded-lg">
            <h4 className="font-semibold mb-2">💡 نصيحة</h4>
            <p className="text-sm text-muted-foreground">
              احتفظ بهذه الصفحة كمرجع. يمكنك أيضاً حفظ معلومات الاتصال للتواصل معنا عند الحاجة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};