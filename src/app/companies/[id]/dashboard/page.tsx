'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { reportsApi, api, usersApi, expensesApi, vehiclesApi } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import RecentExpenses from '@/components/dashboard/RecentExpenses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import type { DashboardKPIs, Vehicle, User, Expense } from '@fleetflow/types';

interface Company {
  _id: string;
  name: string;
  plan: string;
  status: string;
  driverLimit: number;
}

export default function CompanyDashboard() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  
  const [company, setCompany] = useState<Company | null>(null);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCompanyDashboard();
  }, [companyId]);

  const loadCompanyDashboard = async () => {
    try {
      // Load company data, drivers, vehicles, and expenses for this specific company
      const [
        companyResponse,
        driversResponse,
        vehiclesResponse,
        expensesResponse
      ] = await Promise.all([
        api.get(`/companies/${companyId}`),
        usersApi.getUsers({ companyId, role: 'DRIVER', limit: 50 }),
        vehiclesApi.getVehicles({ companyId, limit: 50 }),
        expensesApi.getExpenses({ companyId, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' })
      ]);

      if (companyResponse.data.success) {
        setCompany(companyResponse.data.data);
      }

      if (driversResponse.data.success) {
        setDrivers(driversResponse.data.data.data || []);
      }

      if (vehiclesResponse.data.success) {
        setVehicles(vehiclesResponse.data.data.data || []);
      }

      if (expensesResponse.data.success) {
        setExpenses(expensesResponse.data.data.data || []);
      }

      // Try to get KPIs for this company (this might need API updates to support companyId parameter)
      try {
        const kpiResponse = await reportsApi.getDashboard({ companyId });
        if (kpiResponse.success) {
          setKpis(kpiResponse.data);
        }
      } catch (kpiError) {
        // KPIs might not be available for specific companies yet
        console.log('KPIs not available for company-specific dashboard');
      }

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load company dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToSuperAdmin = () => {
    router.push('/dashboard/super-admin');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading company dashboard...</p>
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
              <h3 className="text-sm font-medium text-red-800">Error Loading Company Dashboard</h3>
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {company?.name} Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Company-specific fleet management overview</p>
          </div>
          <Button 
            onClick={handleReturnToSuperAdmin}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            ← Return to Super Admin
          </Button>
        </div>

        {/* Company Info Card */}
        {company && (
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Plan</label>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {company.plan}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    company.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {company.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Driver Limit</label>
                  <p className="text-gray-900">{company.driverLimit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Current Drivers</label>
                  <p className="text-gray-900">{drivers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <StatCard
              title="Active Drivers"
              value={formatNumber(drivers.filter(d => d.status === 'ACTIVE').length)}
              description="Drivers with active status"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              }
            />

            <StatCard
              title="Total Vehicles"
              value={formatNumber(vehicles.length)}
              description="Registered vehicles"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M5 17H3v-2l1.5-5A1 1 0 0 1 5.5 9h13a1 1 0 0 1 .95.69L21 14v3h-2M7 9V6a4 4 0 0 1 8 0v3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              }
            />
          </div>
        )}

        {/* Grid Layout for detailed sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Drivers List */}
          <Card>
            <CardHeader>
              <CardTitle>Drivers ({drivers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {drivers.length > 0 ? (
                <div className="space-y-4">
                  {drivers.slice(0, 5).map((driver) => (
                    <div key={driver._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                        <p className="text-sm text-gray-500">{driver.email}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        driver.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {driver.status}
                      </span>
                    </div>
                  ))}
                  {drivers.length > 5 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      and {drivers.length - 5} more drivers...
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No drivers found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehicles List */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicles ({vehicles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicles.length > 0 ? (
                <div className="space-y-4">
                  {vehicles.slice(0, 5).map((vehicle) => (
                    <div key={vehicle._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">{vehicle.make} {vehicle.model}</h3>
                        <p className="text-sm text-gray-500">{vehicle.licensePlate} • {vehicle.year}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatNumber(vehicle.currentOdometer || 0)} km
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          vehicle.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                          vehicle.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {vehicle.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {vehicles.length > 5 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      and {vehicles.length - 5} more vehicles...
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No vehicles found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Expenses */}
        {expenses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses ({expenses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.map((expense) => {
                  const driver = drivers.find(d => d._id === expense.driverId);
                  return (
                    <div key={expense._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {formatCurrency(expense.amountFinal)} • {expense.type}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {driver?.name || 'Unknown Driver'} • {formatDate(new Date(expense.date))}
                        </p>
                        {expense.merchant && (
                          <p className="text-xs text-gray-400">at {expense.merchant}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {formatDate(new Date(expense.createdAt))}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}