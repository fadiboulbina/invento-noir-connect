import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface Order {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'pending';
  date: string;
}

// Mock data
const recentOrders: Order[] = [
  { id: '001', customer: 'Ahmed Belhadi', product: 'Samsung Galaxy A54', amount: 45000, status: 'paid', date: '2024-01-15' },
  { id: '002', customer: 'Fatima Benali', product: 'iPhone 15', amount: 180000, status: 'pending', date: '2024-01-14' },
  { id: '003', customer: 'Karim Meziane', product: 'Laptop Dell', amount: 95000, status: 'unpaid', date: '2024-01-14' },
  { id: '004', customer: 'Amina Cherif', product: 'Headphones Sony', amount: 15000, status: 'paid', date: '2024-01-13' },
  { id: '005', customer: 'Omar Saidi', product: 'Tablet iPad', amount: 75000, status: 'paid', date: '2024-01-13' },
];

export const RecentOrdersTable: React.FC = () => {
  const { t } = useLanguage();

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'paid': return 'bg-success/10 text-success border-success/20';
      case 'unpaid': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

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
        <CardTitle className="flex items-center gap-2">
          {t.recentOrders}
          <Badge variant="secondary" className="ml-auto">
            {recentOrders.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex-1">
                <div className="font-medium text-foreground">{order.customer}</div>
                <div className="text-sm text-muted-foreground">{order.product}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-semibold text-foreground">{formatCurrency(order.amount)}</div>
                  <div className="text-xs text-muted-foreground">{order.date}</div>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {t[order.status]}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};