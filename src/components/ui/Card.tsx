import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'sm',
  rounded = 'lg',
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadows = {
    none: '',
    sm: 'shadow-soft',
    md: 'shadow-medium',
    lg: 'shadow-large'
  };

  const roundings = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-xl',
    xl: 'rounded-2xl'
  };

  return (
    <div
      className={cn(
        'bg-white border border-secondary-200/50 backdrop-blur-sm',
        paddings[padding],
        shadows[shadow],
        roundings[rounded],
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={cn('border-b border-secondary-200/50 pb-4 mb-6', className)}>
    {children}
  </div>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => (
  <h3 className={cn('text-xl font-bold text-secondary-900 tracking-tight', className)}>
    {children}
  </h3>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
  <div className={className}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardContent };