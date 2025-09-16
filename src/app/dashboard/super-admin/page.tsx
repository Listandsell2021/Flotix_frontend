'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, expensesApi } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SystemStats {
  totalCompanies: number;
  activeCompanies: number;
  totalDrivers: number;
  activeDrivers: number;
  totalVehicles: number;
  totalExpenses: number;
  thisMonthExpenses: number;
  avgExpensePerCompany: number;
}

interface CompanyOverview {
  _id: string;
  name: string;
  plan: string;
  status: string;
  driverCount: number;
  vehicleCount: number;
  totalExpenses: number;
  thisMonthExpenses: number;
  lastActivity?: string;
}

interface RecentActivity {
  type: 'company_created' | 'user_created' | 'expense_submitted';
  companyName: string;
  details: string;
  timestamp: string;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [companies, setCompanies] = useState<CompanyOverview[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load system-wide data
      const [companiesResponse, expensesResponse] = await Promise.all([
        api.get('/companies'),
        expensesApi.getExpenses({ limit: 100 }) // Get recent expenses for analytics
      ]);

      if (!companiesResponse.data.success) {
        setError('Failed to load system data');
        return;
      }

      const companiesData = companiesResponse.data.data.data || [];
      setCompanies(companiesData);

      // Calculate system stats
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const allExpenses = expensesResponse.data?.data?.data || [];
      const thisMonthExpenses = allExpenses.filter((expense: any) => 
        new Date(expense.date) >= thisMonth
      );

      const totalExpenseAmount = allExpenses.reduce((sum: number, expense: any) => sum + expense.amountFinal, 0);
      const thisMonthExpenseAmount = thisMonthExpenses.reduce((sum: number, expense: any) => sum + expense.amountFinal, 0);

      // Calculate aggregated stats (these would normally come from backend)
      const totalDrivers = companiesData.reduce((sum: number, company: any) => sum + (company.currentDriverCount || 0), 0);
      const totalVehicles = companiesData.reduce((sum: number, company: any) => sum + (company.vehicleCount || 0), 0);

      setStats({
        totalCompanies: companiesData.length,
        activeCompanies: companiesData.filter((c: any) => c.status === 'ACTIVE').length,
        totalDrivers,
        activeDrivers: Math.floor(totalDrivers * 0.85), // Estimated active drivers
        totalVehicles,
        totalExpenses: totalExpenseAmount,
        thisMonthExpenses: thisMonthExpenseAmount,
        avgExpensePerCompany: companiesData.length > 0 ? totalExpenseAmount / companiesData.length : 0
      });

      // Generate mock recent activities (in real app, this would come from audit logs)
      const mockActivities: RecentActivity[] = [
        {
          type: 'company_created',
          companyName: companiesData[0]?.name || 'New Company',
          details: 'Company registered with Professional plan',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'expense_submitted',
          companyName: companiesData[1]?.name || 'Company ABC',
          details: 'New fuel expense submitted by driver',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'user_created',
          companyName: companiesData[0]?.name || 'New Company',
          details: 'New admin user created',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ];

      setRecentActivities(mockActivities);

    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading system dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'secondary';
      case 'SUSPENDED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'STARTER':
        return 'bg-gray-100 text-gray-800';
      case 'PROFESSIONAL':
        return 'bg-blue-100 text-blue-800';
      case 'ENTERPRISE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'company_created':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        );
      case 'user_created':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'expense_submitted':
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
            <p className="text-gray-600 mt-2">Monitor all companies, users, and platform activities</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/companies">
              <Button variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Manage Companies
              </Button>
            </Link>
            <Link href="/role-management">
              <Button variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Manage Roles
              </Button>
            </Link>
            <Link href="/user-management">
              <Button>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Manage Users
              </Button>
            </Link>
          </div>
        </div>

        {/* System Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Companies</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
                    <p className="text-xs text-gray-500">
                      {stats.activeCompanies} active
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalDrivers}</p>
                    <p className="text-xs text-gray-500">
                      {stats.activeDrivers} active
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalExpenses)}</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(stats.thisMonthExpenses)} this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg per Company</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.avgExpensePerCompany)}</p>
                    <p className="text-xs text-gray-500">
                      {stats.totalVehicles} vehicles total
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Companies Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Companies Overview</span>
                  <Link href="/companies">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {companies.length > 0 ? (
                  <div className="space-y-4">
                    {companies.slice(0, 5).map((company) => (
                      <div key={company._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getPlanColor(company.plan)}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{company.name}</h3>
                            <p className="text-sm text-gray-500">
                              {company.driverCount || 0} drivers • {company.vehicleCount || 0} vehicles
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatCurrency(company.thisMonthExpenses || 0)} this month
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <Badge variant={getStatusColor(company.status)}>
                              {company.status}
                            </Badge>
                            <Badge variant="outline" className={`mt-1 block text-xs ${getPlanColor(company.plan)}`}>
                              {company.plan}
                            </Badge>
                          </div>
                          
                          <Link href={`/companies/${company._id}`}>
                            <Button variant="outline" size="sm">
                              View Data
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">🏢</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No companies yet</h3>
                    <p className="text-gray-500">Companies will appear here once they register.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.companyName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.details}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(new Date(activity.timestamp))}
                      </p>
                    </div>
                  </div>
                ))}
                
                {recentActivities.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">📊</div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">No recent activity</h3>
                    <p className="text-xs text-gray-500">System activities will appear here.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}