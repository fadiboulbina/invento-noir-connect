import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  gradient?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  gradient = false 
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className={`glass-card hover-lift ${gradient ? 'gradient-card' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-2xl font-bold text-foreground">{value}</h3>
              {change && (
                <span className={`text-sm font-medium ${getChangeColor()}`}>
                  {change}
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${gradient ? 'bg-white/10' : 'bg-primary/10'}`}>
            <Icon className={`h-6 w-6 ${gradient ? 'text-white' : 'text-primary'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};