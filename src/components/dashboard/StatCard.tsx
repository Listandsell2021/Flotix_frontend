import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  description,
  className
}) => {
  const formatChange = (changeValue: number) => {
    const prefix = changeValue > 0 ? '+' : '';
    return `${prefix}${changeValue.toFixed(1)}%`;
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'success';
      case 'down':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
          </svg>
        );
    }
  };

  return (
    <Card className={cn("group relative hover:shadow-large hover:-translate-y-1 transition-all duration-300 border-0 bg-white/70 backdrop-blur-md overflow-hidden hover:bg-white/80", className)}>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-secondary-600 uppercase tracking-wide group-hover:text-secondary-700 transition-colors duration-300">{title}</h3>
              {icon && (
                <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl group-hover:from-primary-200 group-hover:to-primary-100 transition-all duration-500 shadow-soft group-hover:shadow-glow group-hover:scale-110 group-hover:rotate-3">
                  <div className="text-primary-600 group-hover:animate-bounce-gentle">
                    {icon}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <p className="text-3xl font-bold text-secondary-900 tracking-tight group-hover:text-primary-700 transition-colors duration-300 animate-counter-up">{value}</p>
            </div>

            {change && (
              <div className="flex items-center space-x-3 mb-2">
                <div className={cn(
                  "inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105",
                  change.trend === 'up' && "bg-success-100 text-success-700 hover:bg-success-200",
                  change.trend === 'down' && "bg-accent-100 text-accent-700 hover:bg-accent-200",
                  change.trend === 'neutral' && "bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
                )}>
                  {getTrendIcon(change.trend)}
                  <span>{formatChange(change.value)}</span>
                </div>
                <span className="text-sm text-secondary-500 font-medium">{change.label}</span>
              </div>
            )}

            {description && (
              <p className="text-sm text-secondary-500 leading-relaxed">{description}</p>
            )}
          </div>
        </div>

        {/* Enhanced decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-b-lg opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:h-2"></div>
        
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer bg-[length:200%_100%]"></div>
        
        {/* Floating particles effect */}
        <div className="absolute top-2 right-2 w-1 h-1 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-float transition-all duration-700" style={{animationDelay: '0.1s'}}></div>
        <div className="absolute top-4 right-8 w-0.5 h-0.5 bg-primary-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-float transition-all duration-700" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute top-6 right-4 w-0.5 h-0.5 bg-primary-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-float transition-all duration-700" style={{animationDelay: '0.5s'}}></div>
      </CardContent>
    </Card>
  );
};

export default StatCard;