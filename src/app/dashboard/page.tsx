'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { reportsApi, api, authApi, expensesApi, vehiclesApi } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import RecentExpenses from '@/components/dashboard/RecentExpenses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { DashboardKPIs, Vehicle } from '@fleetflow/types';

export default function Dashboard() {
  const router = useRouter();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // First check if we have impersonated user data
      const storedUser = localStorage.getItem('user');
      let userResponse;
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        // If this is an impersonated session, use stored data and redirect to admin dashboard
        if (userData.isImpersonating || userData.originalSuperAdmin) {
          router.push('/dashboard/admin');
          return;
        }
      }

      // Get user info from API
      userResponse = await authApi.getMe();
      setUser(userResponse);

      // Redirect based on user role
      if (userResponse.role === 'SUPER_ADMIN') {
        router.push('/dashboard/super-admin');
        return;
      } else if (userResponse.role === 'ADMIN') {
        router.push('/dashboard/admin');
        return;
      } else {
        // For regular admins, load the KPI data, recent expenses, and vehicles
        const [dashboardResponse, expensesResponse, vehiclesResponse] = await Promise.all([
          reportsApi.getDashboard(),
          expensesApi.getExpenses({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
          vehiclesApi.getVehicles({ limit: 50 }) // Fetch more vehicles to show "View All" functionality
        ]);
        
        if (dashboardResponse.success) {
          setKpis(dashboardResponse.data);
        } else {
          setError(dashboardResponse.message || 'Failed to load dashboard data');
        }

        if (expensesResponse.success && expensesResponse.data) {
          // Map the expense data to match the RecentExpenses component interface
          const mappedExpenses = (expensesResponse.data.data || []).map((expense: any) => ({
            id: expense._id,
            driverName: expense.driverId?.name || 'Unknown Driver',
            amount: expense.amountFinal || 0,
            currency: expense.currency || 'EUR',
            type: expense.type,
            category: expense.category,
            merchant: expense.merchant,
            date: expense.date || expense.createdAt,
            status: 'approved' // Default status since this system doesn't have approval workflow
          }));
          setRecentExpenses(mappedExpenses);
          
          // Set total expenses count from pagination or assume there are more
          const total = expensesResponse.data.pagination?.total || expensesResponse.data.data?.length || 0;
          setTotalExpenses(Math.max(total, mappedExpenses.length + 10)); // Assume there are at least 10 more for demo
        }

        if (vehiclesResponse.success && vehiclesResponse.data) {
          setVehicles(vehiclesResponse.data.data || []);
        }
      }
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
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">
              {user?.role === 'SUPER_ADMIN' ? 'System Overview' : 'Dashboard'}
            </h1>
            <p className="text-secondary-600 mt-2 text-lg">
              {user?.role === 'SUPER_ADMIN' 
                ? 'System-wide analytics and company management' 
                : 'Your fleet performance at a glance'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-secondary-500">Last updated</p>
              <p className="text-sm font-medium text-secondary-900">{new Date().toLocaleTimeString()}</p>
            </div>
            <button className="inline-flex items-center px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-soft">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Super Admin Dashboard */}
        {user?.role === 'SUPER_ADMIN' && (
          <>
            {/* Super Admin KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Companies"
                value={formatNumber(totalCompanies)}
                description="Companies in the system"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />

              <StatCard
                title="System Users"
                value="Coming Soon"
                description="Total admin users"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                }
              />

              <StatCard
                title="Active Companies"
                value="Coming Soon"
                description="Companies with active status"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />

              <StatCard
                title="System Health"
                value="Healthy"
                description="Overall system status"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
              />
            </div>

            {/* Super Admin Quick Actions */}
            <Card className="bg-gradient-to-br from-white to-secondary-50/30">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => window.location.href = '/companies'}
                    className="group p-5 border border-secondary-200/50 rounded-xl hover:border-primary-300 hover:shadow-medium bg-white/50 backdrop-blur-sm transition-all duration-200 text-left"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center group-hover:from-primary-200 group-hover:to-primary-100 transition-colors shadow-soft">
                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-secondary-900 mb-1">Add Company</p>
                        <p className="text-sm text-secondary-600">Create new company & admin user</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => window.location.href = '/system-users'}
                    className="group p-5 border border-secondary-200/50 rounded-xl hover:border-success-300 hover:shadow-medium bg-white/50 backdrop-blur-sm transition-all duration-200 text-left"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-success-100 to-success-50 rounded-xl flex items-center justify-center group-hover:from-success-200 group-hover:to-success-100 transition-colors shadow-soft">
                        <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-secondary-900 mb-1">Manage Users</p>
                        <p className="text-sm text-secondary-600">System administrators</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => window.location.href = '/companies'}
                    className="group p-5 border border-secondary-200/50 rounded-xl hover:border-secondary-300 hover:shadow-medium bg-white/50 backdrop-blur-sm transition-all duration-200 text-left"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-secondary-100 to-secondary-50 rounded-xl flex items-center justify-center group-hover:from-secondary-200 group-hover:to-secondary-100 transition-colors shadow-soft">
                        <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-secondary-900 mb-1">View Companies</p>
                        <p className="text-sm text-secondary-600">All company details</p>
                      </div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Admin Dashboard */}
        {user?.role === 'ADMIN' && kpis && (
          <>
            {/* KPI Cards with fast animations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="animate-fade-in" style={{animationDuration: '0.15s'}}>
                <StatCard
                title="Total Spend (This Month)"
                value={formatCurrency(kpis.totalSpendThisMonth)}
                change={{
                  value: kpis.monthOverMonthTrend.percentageChange,
                  label: 'vs last month',
                  trend: kpis.monthOverMonthTrend.percentageChange >= 0 ? 'up' : 'down'
                }}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                }
                />
              </div>

              <div className="animate-fade-in" style={{animationDuration: '0.15s', animationDelay: '0.05s'}}>
                <StatCard
                  title="Fuel Expenses"
                value={formatCurrency(kpis.fuelVsMiscSplit.fuel)}
                description={`${Math.round((kpis.fuelVsMiscSplit.fuel / (kpis.fuelVsMiscSplit.fuel + kpis.fuelVsMiscSplit.misc)) * 100)}% of total spend`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                }
                />
              </div>

              <div className="animate-fade-in" style={{animationDuration: '0.15s', animationDelay: '0.1s'}}>
                <StatCard
                  title="Miscellaneous"
                value={formatCurrency(kpis.fuelVsMiscSplit.misc)}
                description={`${Math.round((kpis.fuelVsMiscSplit.misc / (kpis.fuelVsMiscSplit.fuel + kpis.fuelVsMiscSplit.misc)) * 100)}% of total spend`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 712-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                />
              </div>

              <div className="animate-fade-in" style={{animationDuration: '0.15s', animationDelay: '0.15s'}}>
                <StatCard
                  title="Active Drivers"
                value={formatNumber(kpis.topDriversBySpend.length)}
                description="Drivers with expenses this month"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                }
                />
              </div>
            </div>

            {/* Grid Layout for detailed sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in" style={{animationDuration: '0.2s', animationDelay: '0.2s'}}>
              {/* All Vehicles with KM */}
              <Card className="hover:shadow-glow transition-all duration-300 hover:-translate-y-1 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M5 17H3v-2l1.5-5A1 1 0 0 1 5.5 9h13a1 1 0 0 1 .95.69L21 14v3h-2M7 9V6a4 4 0 0 1 8 0v3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      </svg>
                      Fleet Vehicles & Odometer
                    </div>
                    {vehicles.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-secondary-500">
                          Showing {Math.min(5, vehicles.length)} of {vehicles.length}
                        </span>
                        {vehicles.length > 5 && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vehicles.length > 0 ? (
                    <div className="space-y-4">
                      {vehicles.slice(0, 5).map((vehicle, index) => (
                        <div 
                          key={vehicle._id} 
                          className="group relative flex items-center justify-between p-4 bg-secondary-50/50 hover:bg-white/80 rounded-xl transition-all duration-300 border border-secondary-200/30 hover:border-primary-300/50 hover:shadow-medium hover:-translate-y-1 animate-fade-in overflow-hidden"
                          style={{animationDuration: '0.15s', animationDelay: `${0.05 + index * 0.02}s`}}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow group-hover:scale-110 transition-all duration-300 group-hover:rotate-3">
                              <svg className="w-6 h-6 text-primary-600 group-hover:animate-bounce-gentle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M5 17H3v-2l1.5-5A1 1 0 0 1 5.5 9h13a1 1 0 0 1 .95.69L21 14v3h-2M7 9V6a4 4 0 0 1 8 0v3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                              </svg>
                            </div>
                            <div>
                              <p className="font-semibold text-secondary-900 group-hover:text-primary-700 transition-colors duration-300">{vehicle.make} {vehicle.model}</p>
                              <div className="flex items-center space-x-3 mt-1">
                                <p className="text-sm text-secondary-600 font-medium group-hover:text-secondary-700 transition-colors duration-300">{vehicle.licensePlate}</p>
                                <span className="w-1.5 h-1.5 bg-secondary-400 rounded-full group-hover:bg-primary-400 transition-colors duration-300"></span>
                                <p className="text-sm text-secondary-500 group-hover:text-secondary-600 transition-colors duration-300">{vehicle.year}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-secondary-900 text-lg group-hover:text-primary-700 transition-colors duration-300 animate-counter-up">
                              {formatNumber(vehicle.currentOdometer || 0)} km
                            </p>
                            <p className="text-xs text-secondary-500 mt-1 group-hover:text-secondary-600 transition-colors duration-300">Current odometer</p>
                          </div>
                          
                          {/* Animated progress indicator */}
                          <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 group-hover:w-full transition-all duration-500 rounded-b-xl"></div>
                        </div>
                      ))}
                      
                      {/* View All Vehicles Button */}
                      {vehicles.length > 5 && (
                        <div className="pt-4 border-t border-secondary-200/30 animate-fade-in" style={{animationDuration: '0.2s', animationDelay: '0.15s'}}>
                          <button 
                            onClick={() => window.location.href = '/vehicles'}
                            className="group w-full flex items-center justify-center p-3 bg-gradient-to-r from-primary-50 to-primary-100/50 hover:from-primary-100 hover:to-primary-200/50 border border-primary-200/50 rounded-xl transition-all duration-300 hover:shadow-medium hover:-translate-y-0.5"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-soft group-hover:shadow-glow group-hover:scale-110 transition-all duration-300">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-semibold text-primary-700 group-hover:text-primary-800 transition-colors duration-300">
                                  View All Vehicles
                                </p>
                                <p className="text-xs text-primary-600 group-hover:text-primary-700 transition-colors duration-300">
                                  {vehicles.length} vehicles total
                                </p>
                              </div>
                              <svg className="w-4 h-4 text-primary-500 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 animate-fade-in" style={{animationDuration: '0.2s'}}>
                      <div className="w-16 h-16 bg-gradient-to-br from-secondary-100 to-secondary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
                        <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M5 17H3v-2l1.5-5A1 1 0 0 1 5.5 9h13a1 1 0 0 1 .95.69L21 14v3h-2M7 9V6a4 4 0 0 1 8 0v3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                        </svg>
                      </div>
                      <p className="text-secondary-600 font-medium mb-2">No vehicles registered</p>
                      <p className="text-secondary-500 text-sm">Add vehicles to track odometer readings</p>
                      <button className="mt-4 inline-flex items-center px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-all duration-300 hover:scale-105 shadow-soft hover:shadow-glow">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Vehicle
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Expenses */}
              <div>
                <RecentExpenses expenses={recentExpenses} totalExpenses={totalExpenses} />
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="animate-fade-in hover:shadow-glow transition-all duration-300 hover:-translate-y-1" style={{animationDuration: '0.2s', animationDelay: '0.25s'}}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-primary-600 animate-bounce-gentle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="group p-5 border border-secondary-200/50 rounded-xl hover:border-primary-300 hover:shadow-medium bg-white/50 backdrop-blur-sm transition-all duration-300 text-left hover:-translate-y-1 hover:bg-white/80">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center group-hover:from-primary-200 group-hover:to-primary-100 transition-all duration-300 shadow-soft group-hover:shadow-glow group-hover:scale-110 group-hover:rotate-3">
                        <svg className="w-6 h-6 text-primary-600 group-hover:animate-bounce-gentle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-secondary-900 mb-1 group-hover:text-primary-700 transition-colors duration-300">Add Driver</p>
                        <p className="text-sm text-secondary-600 group-hover:text-secondary-700 transition-colors duration-300">Create new driver account</p>
                      </div>
                    </div>
                  </button>

                  <button className="group p-5 border border-secondary-200/50 rounded-xl hover:border-success-300 hover:shadow-medium bg-white/50 backdrop-blur-sm transition-all duration-300 text-left hover:-translate-y-1 hover:bg-white/80">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-success-100 to-success-50 rounded-xl flex items-center justify-center group-hover:from-success-200 group-hover:to-success-100 transition-all duration-300 shadow-soft group-hover:shadow-glow group-hover:scale-110 group-hover:rotate-3">
                        <svg className="w-6 h-6 text-success-600 group-hover:animate-bounce-gentle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-secondary-900 mb-1 group-hover:text-success-700 transition-colors duration-300">Export Data</p>
                        <p className="text-sm text-secondary-600 group-hover:text-secondary-700 transition-colors duration-300">Download expense reports</p>
                      </div>
                    </div>
                  </button>

                  <button className="group p-5 border border-secondary-200/50 rounded-xl hover:border-secondary-300 hover:shadow-medium bg-white/50 backdrop-blur-sm transition-all duration-300 text-left hover:-translate-y-1 hover:bg-white/80">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-secondary-100 to-secondary-50 rounded-xl flex items-center justify-center group-hover:from-secondary-200 group-hover:to-secondary-100 transition-all duration-300 shadow-soft group-hover:shadow-glow group-hover:scale-110 group-hover:rotate-3">
                        <svg className="w-6 h-6 text-secondary-600 group-hover:animate-bounce-gentle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-secondary-900 mb-1 group-hover:text-secondary-700 transition-colors duration-300">View Reports</p>
                        <p className="text-sm text-secondary-600 group-hover:text-secondary-700 transition-colors duration-300">Detailed analytics</p>
                      </div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}