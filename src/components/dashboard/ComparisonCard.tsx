'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/lib/i18n';

interface ComparisonData {
  period1: {
    total: number;
    fuel: number;
    misc: number;
    count: number;
    avgExpense: number;
    driverCount: number;
    period: { start: string; end: string };
  };
  period2: {
    total: number;
    fuel: number;
    misc: number;
    count: number;
    avgExpense: number;
    driverCount: number;
    period: { start: string; end: string };
  };
  changes: {
    totalChange: number;
    fuelChange: number;
    miscChange: number;
    countChange: number;
    avgExpenseChange: number;
    driverCountChange: number;
  };
}

interface ComparisonCardProps {
  data: ComparisonData;
}

export default function ComparisonCard({ data }: ComparisonCardProps) {
  const { t } = useTranslation('dashboard');

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-red-600';
    if (change < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    }
    if (change < 0) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    );
  };

  const formatPeriod = (period: { start: string; end: string }) => {
    const start = new Date(period.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(period.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  return (
    <Card className="hover:shadow-glow transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {t('comparison.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Period Headers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">{t('comparison.period1')}</p>
              <p className="text-xs text-blue-500 mt-1">{formatPeriod(data.period1.period)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">{t('comparison.period2')}</p>
              <p className="text-xs text-purple-500 mt-1">{formatPeriod(data.period2.period)}</p>
            </div>
          </div>

          {/* Comparison Metrics */}
          <div className="space-y-4">
            {/* Total Spend */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{t('comparison.totalSpend')}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-blue-600">{formatCurrency(data.period1.total)}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-sm text-purple-600">{formatCurrency(data.period2.total)}</span>
                </div>
              </div>
              <div className={`flex items-center gap-1 ${getChangeColor(data.changes.totalChange)}`}>
                {getChangeIcon(data.changes.totalChange)}
                <span className="text-sm font-semibold">
                  {Math.abs(data.changes.totalChange).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Fuel */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{t('kpi.fuel')}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-blue-600">{formatCurrency(data.period1.fuel)}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-sm text-purple-600">{formatCurrency(data.period2.fuel)}</span>
                </div>
              </div>
              <div className={`flex items-center gap-1 ${getChangeColor(data.changes.fuelChange)}`}>
                {getChangeIcon(data.changes.fuelChange)}
                <span className="text-sm font-semibold">
                  {Math.abs(data.changes.fuelChange).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Misc */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{t('kpi.misc')}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-blue-600">{formatCurrency(data.period1.misc)}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-sm text-purple-600">{formatCurrency(data.period2.misc)}</span>
                </div>
              </div>
              <div className={`flex items-center gap-1 ${getChangeColor(data.changes.miscChange)}`}>
                {getChangeIcon(data.changes.miscChange)}
                <span className="text-sm font-semibold">
                  {Math.abs(data.changes.miscChange).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Expense Count */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{t('comparison.expenseCount')}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-blue-600">{data.period1.count}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-sm text-purple-600">{data.period2.count}</span>
                </div>
              </div>
              <div className={`flex items-center gap-1 ${getChangeColor(data.changes.countChange)}`}>
                {getChangeIcon(data.changes.countChange)}
                <span className="text-sm font-semibold">
                  {Math.abs(data.changes.countChange).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Average Expense */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{t('comparison.avgExpense')}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-blue-600">{formatCurrency(data.period1.avgExpense)}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-sm text-purple-600">{formatCurrency(data.period2.avgExpense)}</span>
                </div>
              </div>
              <div className={`flex items-center gap-1 ${getChangeColor(data.changes.avgExpenseChange)}`}>
                {getChangeIcon(data.changes.avgExpenseChange)}
                <span className="text-sm font-semibold">
                  {Math.abs(data.changes.avgExpenseChange).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
