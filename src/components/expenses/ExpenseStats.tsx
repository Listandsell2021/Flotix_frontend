'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

interface ExpenseStatsProps {
  stats: {
    totalExpenses: number;
    totalAmount: number;
    fuelExpenses: number;
    miscExpenses: number;
  } | null;
  loading?: boolean;
}

export default function ExpenseStats({ stats, loading }: ExpenseStatsProps) {
  const { t } = useTranslation('expenses');

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="relative overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm animate-pulse">
            <div className="p-5">
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-7 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: t('stats.totalExpenses'),
      value: stats.totalExpenses,
      subtitle: t('stats.count'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      lightGradient: 'from-blue-50 via-blue-100 to-blue-200',
      ringColor: 'ring-blue-500/20',
      textColor: 'text-blue-700',
      bgPattern: 'bg-blue-500/5',
    },
    {
      title: t('stats.totalAmount'),
      value: formatCurrency(stats.totalAmount),
      subtitle: t('stats.totalValue'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-emerald-500 via-emerald-600 to-emerald-700',
      lightGradient: 'from-emerald-50 via-emerald-100 to-emerald-200',
      ringColor: 'ring-emerald-500/20',
      textColor: 'text-emerald-700',
      bgPattern: 'bg-emerald-500/5',
    },
    {
      title: t('stats.fuelExpenses'),
      value: formatCurrency(stats.fuelExpenses),
      subtitle: t('stats.fuelCategory'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: 'from-orange-500 via-orange-600 to-orange-700',
      lightGradient: 'from-orange-50 via-orange-100 to-orange-200',
      ringColor: 'ring-orange-500/20',
      textColor: 'text-orange-700',
      bgPattern: 'bg-orange-500/5',
    },
    {
      title: t('stats.miscExpenses'),
      value: formatCurrency(stats.miscExpenses),
      subtitle: t('stats.miscCategory'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      gradient: 'from-purple-500 via-purple-600 to-purple-700',
      lightGradient: 'from-purple-50 via-purple-100 to-purple-200',
      ringColor: 'ring-purple-500/20',
      textColor: 'text-purple-700',
      bgPattern: 'bg-purple-500/5',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`relative overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 group ${stat.bgPattern}`}
        >
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 opacity-5">
            <div className={`w-full h-full bg-gradient-to-br ${stat.gradient} rounded-full`}></div>
          </div>

          {/* Content */}
          <div className="relative p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  {stat.title}
                </p>
                <h3 className={`text-2xl font-bold ${stat.textColor} group-hover:scale-105 transition-transform origin-left`}>
                  {stat.value}
                </h3>
              </div>
              <div className={`relative bg-gradient-to-br ${stat.lightGradient} p-3 rounded-xl ring-4 ${stat.ringColor} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                <div className={`bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.icon}
                </div>
              </div>
            </div>

            {/* Subtle Bottom Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">{stat.subtitle}</span>
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.gradient} animate-pulse`}></div>
            </div>
          </div>

          {/* Hover Effect Bar */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
        </div>
      ))}
    </div>
  );
}
