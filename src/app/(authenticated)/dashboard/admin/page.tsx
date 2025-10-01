'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { reportsApi, expensesApi } from '@/lib/api';
import StatCard from '@/components/dashboard/StatCard';
import RecentExpenses from '@/components/dashboard/RecentExpenses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { formatCurrency as utilFormatCurrency, formatNumber } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/i18n';
import type { DashboardKPIs } from '@/types';

export default function AdminDashboard() {
  const { t } = useTranslation(['dashboard', 'common']);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashboardResponse, expensesResponse] = await Promise.all([
        reportsApi.getDashboard(),
        expensesApi.getExpenses({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc' })
      ]);

      if (dashboardResponse.success) {
        setKpis(dashboardResponse.data);
      } else {
        setError(dashboardResponse.message || t('error'));
      }

      if (expensesResponse.success && expensesResponse.data) {
        // Map the expense data to match the RecentExpenses component interface
        const mappedExpenses = (expensesResponse.data.data || []).map((expense: any) => ({
          id: expense._id,
          driverName: expense.driverId?.name || t('unknownDriver'),
          amount: expense.amountFinal || 0,
          currency: expense.currency || 'EUR',
          type: expense.type,
          category: expense.category,
          merchant: expense.merchant,
          date: expense.date || expense.createdAt,
          status: 'approved' // Default status since this system doesn't have approval workflow
        }));
        setRecentExpenses(mappedExpenses);

        // Set total expenses count from pagination
        const total = expensesResponse.data.pagination?.total || expensesResponse.data.data?.length || 0;
        setTotalExpenses(total);
      }
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">{t('dashboard:loading')}</p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">{t('dashboard:error')}</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('dashboard:title')}</h1>
            <p className="text-gray-600 mt-1 sm:mt-2">{t('dashboard:welcome')}</p>
          </div>
        </div>

        {kpis && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard
                title={t('dashboard:kpi.totalExpenses')}
                value={formatCurrency(kpis.totalSpendThisMonth)}
                change={kpis.monthOverMonthTrend ? {
                  value: kpis.monthOverMonthTrend.percentageChange || 0,
                  label: t('dashboard:kpi.fromLastMonth'),
                  trend: (kpis.monthOverMonthTrend.percentageChange || 0) >= 0 ? 'up' : 'down'
                } : undefined}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                }
              />

              <StatCard
                title={t('dashboard:kpi.fuel')}
                value={formatCurrency(kpis.fuelVsMiscSplit?.fuel || 0)}
                description={kpis.fuelVsMiscSplit && (kpis.fuelVsMiscSplit.fuel + kpis.fuelVsMiscSplit.misc) > 0
                  ? `${Math.round((kpis.fuelVsMiscSplit.fuel / (kpis.fuelVsMiscSplit.fuel + kpis.fuelVsMiscSplit.misc)) * 100)}% of total spend`
                  : '0% of total spend'}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                }
              />

              <StatCard
                title={t('dashboard:kpi.misc')}
                value={formatCurrency(kpis.fuelVsMiscSplit?.misc || 0)}
                description={kpis.fuelVsMiscSplit && (kpis.fuelVsMiscSplit.fuel + kpis.fuelVsMiscSplit.misc) > 0
                  ? `${Math.round((kpis.fuelVsMiscSplit.misc / (kpis.fuelVsMiscSplit.fuel + kpis.fuelVsMiscSplit.misc)) * 100)}% of total spend`
                  : '0% of total spend'}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />

              <StatCard
                title={t('dashboard:kpi.totalDrivers')}
                value={formatNumber(kpis.topDriversBySpend?.length || 0)}
                description={t('dashboard:kpi.thisMonth')}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                }
              />
            </div>

            {/* Grid Layout for detailed sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Top Drivers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {t('dashboard:charts.topDrivers')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {kpis.topDriversBySpend && kpis.topDriversBySpend.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {kpis.topDriversBySpend.map((driver, index) => (
                        <div key={driver.driverId} className="flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm flex-shrink-0 ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-600' :
                              index === 2 ? 'bg-orange-100 text-orange-600' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{driver.driverName}</p>
                              <p className="text-xs text-gray-500">ID: {driver.driverId.slice(-6)}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">
                              {formatCurrency(driver.totalSpend)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-4">👥</div>
                      <p className="text-gray-500">{t('dashboard:charts.noData')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Expenses */}
              <RecentExpenses expenses={recentExpenses} totalExpenses={totalExpenses} loading={loading} />
            </div>

            {/* Quick Actions */}
          </>
        )}
      </div>
  );
}