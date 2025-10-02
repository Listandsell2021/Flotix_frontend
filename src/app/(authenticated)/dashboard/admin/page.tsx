'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { reportsApi, expensesApi } from '@/lib/api';
import StatCard from '@/components/dashboard/StatCard';
import RecentExpenses from '@/components/dashboard/RecentExpenses';
import TrendChart from '@/components/dashboard/TrendChart';
import ComparisonCard from '@/components/dashboard/ComparisonCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { formatCurrency, formatDate, formatNumber } from '@/lib/i18n';
import type { DashboardKPIs } from '@/types';

export default function AdminDashboard() {
  const { t } = useTranslation(['dashboard', 'common']);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [trendsData, setTrendsData] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Calculate comparison periods (this month vs last month)
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Use Promise.allSettled for graceful error handling
      const results = await Promise.allSettled([
        reportsApi.getDashboard(),
        expensesApi.getExpenses({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        reportsApi.getTrends(6),
        reportsApi.getComparison({
          period1Start: lastMonthStart.toISOString().split('T')[0],
          period1End: lastMonthEnd.toISOString().split('T')[0],
          period2Start: thisMonthStart.toISOString().split('T')[0],
          period2End: thisMonthEnd.toISOString().split('T')[0]
        })
      ]);

      // Handle dashboard KPIs
      if (results[0].status === 'fulfilled' && results[0].value.success) {
        setKpis(results[0].value.data);
      } else {
        const errorMsg = results[0].status === 'rejected'
          ? results[0].reason?.message
          : results[0].value.message;
        setError(errorMsg || t('dashboard:error'));
      }

      // Handle expenses
      if (results[1].status === 'fulfilled' && results[1].value.success && results[1].value.data) {
        const expensesResponse = results[1].value;
        const mappedExpenses = (expensesResponse.data.data || []).map((expense: any) => ({
          id: expense._id,
          driverName: expense.driverId?.name || t('dashboard:unknownDriver'),
          amount: expense.amountFinal || 0,
          currency: expense.currency || 'EUR',
          type: expense.type,
          category: expense.category,
          merchant: expense.merchant,
          date: expense.date || expense.createdAt,
          status: 'approved'
        }));
        setRecentExpenses(mappedExpenses);

        const total = expensesResponse.data.pagination?.total || expensesResponse.data.data?.length || 0;
        setTotalExpenses(total);
      }

      // Handle trends chart data
      if (results[2].status === 'fulfilled' && results[2].value.success) {
        console.log('✅ Trends data received:', results[2].value.data);
        setTrendsData(results[2].value.data);
      } else {
        console.error('❌ Trends data failed:', results[2]);
      }

      // Handle comparison data
      if (results[3].status === 'fulfilled' && results[3].value.success) {
        console.log('✅ Comparison data received:', results[3].value.data);
        setComparisonData(results[3].value.data);
      } else {
        console.error('❌ Comparison data failed:', results[3]);
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || t('dashboard:error'));
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

  if (error && !kpis) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">{t('dashboard:error')}</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <Button
            onClick={() => loadDashboardData()}
            variant="outline"
            className="ml-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t('common:retry')}
          </Button>
        </div>
      </div>
    );
  }

  const getPercentageDisplay = (value: number, total: number): string => {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  };

  const formatTimeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return t('dashboard:justNow');
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t('dashboard:minutesAgo', { count: minutes });
    const hours = Math.floor(minutes / 60);
    return t('dashboard:hoursAgo', { count: hours });
  };

  return (
    <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('dashboard:title')}</h1>
            <p className="text-gray-600 mt-1 sm:mt-2">{t('dashboard:welcome')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500">{t('dashboard:lastUpdated')}</p>
              <p className="text-sm font-medium text-gray-900">{formatTimeSince(lastUpdated)}</p>
            </div>
            <Button
              onClick={() => loadDashboardData()}
              variant="outline"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('dashboard:refresh')}
            </Button>
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
                description={`${getPercentageDisplay(
                  kpis.fuelVsMiscSplit?.fuel || 0,
                  (kpis.fuelVsMiscSplit?.fuel || 0) + (kpis.fuelVsMiscSplit?.misc || 0)
                )} ${t('dashboard:kpi.ofTotalSpend')}`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                }
              />

              <StatCard
                title={t('dashboard:kpi.misc')}
                value={formatCurrency(kpis.fuelVsMiscSplit?.misc || 0)}
                description={`${getPercentageDisplay(
                  kpis.fuelVsMiscSplit?.misc || 0,
                  (kpis.fuelVsMiscSplit?.fuel || 0) + (kpis.fuelVsMiscSplit?.misc || 0)
                )} ${t('dashboard:kpi.ofTotalSpend')}`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />

              <StatCard
                title={t('dashboard:kpi.activeDrivers')}
                value={formatNumber(kpis.totalActiveDrivers || 0)}
                description={t('dashboard:kpi.driversWithExpenses', {
                  count: kpis.driversWithExpensesThisMonth || 0
                })}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                }
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Trend Chart */}
              {trendsData ? (
                <TrendChart
                  labels={trendsData.labels}
                  fuelData={trendsData.datasets.fuel}
                  miscData={trendsData.datasets.misc}
                  totalData={trendsData.datasets.total}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Spending Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center">
                      <div className="text-center">
                        <Spinner size="md" />
                        <p className="mt-4 text-gray-500 text-sm">Loading chart data...</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comparison Card */}
              {comparisonData ? (
                <ComparisonCard data={comparisonData} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Period Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center">
                      <div className="text-center">
                        <Spinner size="md" />
                        <p className="mt-4 text-gray-500 text-sm">Loading comparison data...</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
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