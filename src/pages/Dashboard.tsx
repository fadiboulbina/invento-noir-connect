import React from 'react';
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  TrendingUp,
  Users
} from 'lucide-react';
import { StatCard } from '@/components/Dashboard/StatCard';
import { RecentOrdersTable } from '@/components/Dashboard/RecentOrdersTable';
import { TopProductsChart } from '@/components/Dashboard/TopProductsChart';
import { useLanguage } from '@/contexts/LanguageContext';

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();

  // Mock data - in real app this would come from API
  const stats = {
    totalSales: 15750000,
    totalProducts: 156,
    pendingOrders: 23,
    lowStockItems: 8,
    totalCustomers: 342,
    monthlyGrowth: 12.5
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold gradient-text">{t.dashboard}</h1>
        <p className="text-muted-foreground">
          {t.welcome} - Monitor your inventory and sales performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="xl:col-span-2">
          <StatCard
            title={t.totalSales}
            value={formatCurrency(stats.totalSales)}
            change={`+${stats.monthlyGrowth}%`}
            changeType="positive"
            icon={DollarSign}
            gradient
          />
        </div>
        
        <StatCard
          title={t.products}
          value={stats.totalProducts}
          icon={Package}
        />
        
        <StatCard
          title={t.pendingOrders}
          value={stats.pendingOrders}
          icon={ShoppingCart}
        />
        
        <StatCard
          title={t.lowStock}
          value={stats.lowStockItems}
          changeType="negative"
          icon={AlertTriangle}
        />
        
        <StatCard
          title={t.customers}
          value={stats.totalCustomers}
          change="+12"
          changeType="positive"
          icon={Users}
        />
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersTable />
        <TopProductsChart />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 text-center space-y-2">
          <TrendingUp className="h-8 w-8 mx-auto text-success" />
          <h3 className="font-semibold text-foreground">Revenue Growth</h3>
          <p className="text-2xl font-bold text-success">+12.5%</p>
          <p className="text-sm text-muted-foreground">vs last month</p>
        </div>
        
        <div className="glass-card p-6 text-center space-y-2">
          <Package className="h-8 w-8 mx-auto text-primary" />
          <h3 className="font-semibold text-foreground">Avg. Order Value</h3>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(68500)}</p>
          <p className="text-sm text-muted-foreground">per order</p>
        </div>
        
        <div className="glass-card p-6 text-center space-y-2">
          <Users className="h-8 w-8 mx-auto text-secondary" />
          <h3 className="font-semibold text-foreground">Customer Retention</h3>
          <p className="text-2xl font-bold text-secondary">89%</p>
          <p className="text-sm text-muted-foreground">return rate</p>
        </div>
      </div>
    </div>
  );
};