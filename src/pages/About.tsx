import React from 'react';
import { Phone, ArrowLeft, Users, Award, MapPin, Clock, Shield, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
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
            <h1 className="text-lg font-bold gradient-text">من نحن - Nouacer Telecom</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold gradient-text mb-6">من نحن</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            نحن فريق Nouacer Telecom، متخصصون في بيع أحدث الهواتف الذكية والإلكترونيات 
            بأفضل الأسعار في الجزائر. خبرة سنوات في خدمة العملاء وجودة لا تُضاهى.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold gradient-text mb-6">قصتنا</h2>
            <div className="prose prose-lg text-muted-foreground">
              <p className="mb-4">
                بدأت رحلتنا في عام 2018 كمتجر صغير في قلب الجزائر العاصمة، بحلم بسيط: 
                توفير أفضل المنتجات التقنية بأسعار معقولة وخدمة عملاء استثنائية.
              </p>
              <p className="mb-4">
                اليوم، نحن فخورون بخدمة آلاف العملاء في جميع أنحاء الجزائر، 
                مع شبكة توزيع واسعة وفريق متخصص يعمل على مدار الساعة لضمان رضاكم.
              </p>
              <p>
                رؤيتنا بسيطة: أن نكون الخيار الأول لكل من يبحث عن التكنولوجيا 
                الحديثة بجودة عالية وأسعار تنافسية في الجزائر.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass-card p-6 text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-1">10,000+</h3>
              <p className="text-muted-foreground">عميل راضي</p>
            </Card>
            
            <Card className="glass-card p-6 text-center">
              <Award className="h-12 w-12 text-secondary mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-1">6</h3>
              <p className="text-muted-foreground">سنوات خبرة</p>
            </Card>
            
            <Card className="glass-card p-6 text-center">
              <MapPin className="h-12 w-12 text-success mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-1">48</h3>
              <p className="text-muted-foreground">ولاية نخدمها</p>
            </Card>
            
            <Card className="glass-card p-6 text-center">
              <Clock className="h-12 w-12 text-warning mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-1">24/7</h3>
              <p className="text-muted-foreground">خدمة عملاء</p>
            </Card>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold gradient-text text-center mb-12">قيمنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-card p-8 text-center">
              <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">الجودة والأصالة</h3>
              <p className="text-muted-foreground">
                جميع منتجاتنا أصلية 100% مع ضمانات شاملة من الوكلاء المعتمدين
              </p>
            </Card>
            
            <Card className="glass-card p-8 text-center">
              <Headphones className="h-16 w-16 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">خدمة العملاء</h3>
              <p className="text-muted-foreground">
                فريقنا المتخصص متاح على مدار الساعة لمساعدتكم وحل جميع استفساراتكم
              </p>
            </Card>
            
            <Card className="glass-card p-8 text-center">
              <Award className="h-16 w-16 text-success mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">أسعار تنافسية</h3>
              <p className="text-muted-foreground">
                نلتزم بتقديم أفضل الأسعار في السوق مع عروض وخصومات حصرية
              </p>
            </Card>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold gradient-text text-center mb-12">فريقنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-card p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-bold mb-2">أحمد نواصر</h3>
              <p className="text-primary font-semibold mb-2">المدير العام</p>
              <p className="text-sm text-muted-foreground">
                خبرة 10 سنوات في مجال التكنولوجيا والهواتف الذكية
              </p>
            </Card>
            
            <Card className="glass-card p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-secondary to-primary rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-bold mb-2">فاطمة بن علي</h3>
              <p className="text-secondary font-semibold mb-2">مديرة المبيعات</p>
              <p className="text-sm text-muted-foreground">
                متخصصة في خدمة العملاء وإدارة المبيعات
              </p>
            </Card>
            
            <Card className="glass-card p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-success to-primary rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-bold mb-2">محمد الصالح</h3>
              <p className="text-success font-semibold mb-2">الدعم الفني</p>
              <p className="text-sm text-muted-foreground">
                خبير تقني في صيانة وإصلاح الأجهزة الإلكترونية
              </p>
            </Card>
          </div>
        </div>

        {/* Mission Section */}
        <Card className="glass-card p-12 text-center mb-16">
          <h2 className="text-3xl font-bold gradient-text mb-6">مهمتنا</h2>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
            نسعى لجعل التكنولوجيا الحديثة في متناول الجميع من خلال توفير أحدث الأجهزة 
            بأسعار معقولة، وخدمة عملاء استثنائية، وضمانات شاملة. هدفنا هو بناء علاقات 
            طويلة الأمد مع عملائنا قائمة على الثقة والجودة.
          </p>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold gradient-text mb-6">
            جاهزون لخدمتكم
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            اكتشفوا مجموعتنا الواسعة من المنتجات أو تواصلوا معنا للحصول على استشارة مجانية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/store/products">
              <Button className="btn-gradient px-8 py-3 text-lg">
                تصفح المنتجات
              </Button>
            </Link>
            <Link to="/store/contact">
              <Button variant="outline" className="px-8 py-3 text-lg">
                اتصل بنا
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};