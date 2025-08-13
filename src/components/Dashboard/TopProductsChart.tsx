import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';

interface Product {
  name: string;
  sales: number;
  maxSales: number;
  revenue: number;
}

// Mock data
const topProducts: Product[] = [
  { name: 'Samsung Galaxy A54', sales: 45, maxSales: 50, revenue: 2025000 },
  { name: 'iPhone 15', sales: 32, maxSales: 50, revenue: 5760000 },
  { name: 'Laptop Dell Inspiron', sales: 18, maxSales: 50, revenue: 1710000 },
  { name: 'Sony WH-1000XM5', sales: 25, maxSales: 50, revenue: 375000 },
  { name: 'iPad Air 5th Gen', sales: 12, maxSales: 50, revenue: 900000 },
];

export const TopProductsChart: React.FC = () => {
  const { t } = useLanguage();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>{t.topProducts}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {topProducts.map((product, index) => (
            <div key={product.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-primary' :
                    index === 1 ? 'bg-secondary' :
                    index === 2 ? 'bg-warning' :
                    'bg-muted-foreground'
                  }`} />
                  <span className="font-medium text-foreground">{product.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-foreground">{product.sales} units</div>
                  <div className="text-xs text-muted-foreground">{formatCurrency(product.revenue)}</div>
                </div>
              </div>
              <Progress 
                value={(product.sales / product.maxSales) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};