'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, usersApi, expensesApi, vehiclesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { User, Expense, Vehicle } from '@/types';

interface Company {
  _id: string;
  name: string;
  plan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  driverLimit: number;
  createdAt: string;
  updatedAt: string;
}

interface CompanyStats {
  totalDrivers: number;
  activeDrivers: number;
  totalVehicles: number;
  activeVehicles: number;
  totalExpenses: number;
  thisMonthExpenses: number;
  avgExpensePerDriver: number;
  topSpendingDriver?: {
    name: string;
    email: string;
    totalSpent: number;
  };
}

export default function CompanyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  
  const [company, setCompany] = useState<Company | null>(null);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'drivers' | 'vehicles' | 'expenses'>('overview');
  const [selectedDriver, setSelectedDriver] = useState<User | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  useEffect(() => {
    if (companyId) {
      loadCompanyData();
    }
  }, [companyId]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      
      // Load company details
      console.log('Loading company with ID:', companyId);
      const companyResponse = await api.get(`/companies/${companyId}`);
      console.log('Company response:', companyResponse.data);
      
      if (!companyResponse.data.success) {
        setError(companyResponse.data.message || 'Company not found');
        return;
      }
      
      setCompany(companyResponse.data.data);

      // Load all related data in parallel
      console.log('Loading related data for company:', companyId);
      const [driversResponse, vehiclesResponse, expensesResponse] = await Promise.all([
        // Load drivers for this company
        usersApi.getUsers({ companyId, role: 'DRIVER' }).catch(err => {
          console.error('Failed to load drivers:', err);
          return { success: false, data: { data: [] } };
        }),
        // Load vehicles for this company  
        vehiclesApi.getVehicles({ companyId }).catch(err => {
          console.error('Failed to load vehicles:', err);
          return { success: false, data: { data: [] } };
        }),
        // Load recent expenses for this company
        expensesApi.getExpenses({ companyId, limit: 50 }).catch(err => {
          console.error('Failed to load expenses:', err);
          return { success: false, data: { data: [] } };
        })
      ]);

      if (driversResponse.success) {
        setDrivers(driversResponse.data.data || []);
      }

      if (vehiclesResponse.success) {
        setVehicles(vehiclesResponse.data.data || []);
      }

      if (expensesResponse.success) {
        setExpenses(expensesResponse.data.data || []);
      }

      // Calculate stats
      calculateStats(
        driversResponse.data?.data || [],
        vehiclesResponse.data?.data || [],
        expensesResponse.data?.data || []
      );

    } catch (err: any) {
      console.error('Error loading company data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load company data';
      setError(`${errorMessage} (Company ID: ${companyId})`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDriver = (driver: User) => {
    setSelectedDriver(driver);
    setShowDriverModal(true);
  };

  const handleViewVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleModal(true);
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowExpenseModal(true);
  };

  const calculateStats = (drivers: User[], vehicles: Vehicle[], expenses: Expense[]) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonthExpenses = expenses.filter(expense => 
      new Date(expense.date) >= thisMonth
    );
    
    const totalExpenseAmount = expenses.reduce((sum, expense) => sum + expense.amountFinal, 0);
    const thisMonthExpenseAmount = thisMonthExpenses.reduce((sum, expense) => sum + expense.amountFinal, 0);
    
    // Calculate top spending driver
    const driverExpenses = expenses.reduce((acc, expense) => {
      acc[expense.driverId] = (acc[expense.driverId] || 0) + expense.amountFinal;
      return acc;
    }, {} as Record<string, number>);
    
    const topDriverId = Object.keys(driverExpenses).reduce((a, b) => 
      driverExpenses[a] > driverExpenses[b] ? a : b, Object.keys(driverExpenses)[0]
    );
    
    const topDriver = drivers.find(d => d._id === topDriverId);
    
    setStats({
      totalDrivers: drivers.length,
      activeDrivers: drivers.filter(d => d.status === 'ACTIVE').length,
      totalVehicles: vehicles.length,
      activeVehicles: vehicles.filter(v => v.status === 'ACTIVE').length,
      totalExpenses: totalExpenseAmount,
      thisMonthExpenses: thisMonthExpenseAmount,
      avgExpensePerDriver: drivers.length > 0 ? totalExpenseAmount / drivers.length : 0,
      topSpendingDriver: topDriver ? {
        name: topDriver.name,
        email: topDriver.email,
        totalSpent: driverExpenses[topDriverId] || 0
      } : undefined
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading company data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading Company</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'secondary';
      case 'SUSPENDED':
        return 'danger';
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

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-gray-600 mt-2">Complete company overview and data tracking</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={getStatusColor(company.status)}>
              {company.status}
            </Badge>
            <Badge variant="default" className={getPlanColor(company.plan)}>
              {company.plan}
            </Badge>
            {/* HIDDEN: Export functionality - Re-enable when backend ready */}
            {/* <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export All Data
            </Button> */}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalDrivers}</p>
                    <p className="text-xs text-gray-500">
                      {stats.activeDrivers} active • Limit: {company.driverLimit}
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
                    <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalVehicles}</p>
                    <p className="text-xs text-gray-500">
                      {stats.activeVehicles} active
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M5 17H3v-2l1.5-5A1 1 0 0 1 5.5 9h13a1 1 0 0 1 .95.69L21 14v3h-2M7 9V6a4 4 0 0 1 8 0v3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
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
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalExpenses)}</p>
                    <p className="text-xs text-gray-500">
                      This month: {formatCurrency(stats.thisMonthExpenses)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <p className="text-sm font-medium text-gray-600">Avg per Driver</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgExpensePerDriver)}</p>
                    {stats.topSpendingDriver && (
                      <p className="text-xs text-gray-500">
                        Top: {stats.topSpendingDriver.name}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'drivers', name: 'Drivers', icon: '👥' },
              { id: 'vehicles', name: 'Vehicles', icon: '🚗' },
              { id: 'expenses', name: 'Expenses', icon: '💰' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
                <span className="bg-gray-100 text-gray-900 ml-2 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.id === 'drivers' && drivers.length}
                  {tab.id === 'vehicles' && vehicles.length}
                  {tab.id === 'expenses' && expenses.length}
                  {tab.id === 'overview' && '4'}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Company ID</label>
                      <p className="font-mono text-sm text-gray-900">{company._id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Created Date</label>
                      <p className="text-gray-900">{formatDate(new Date(company.createdAt))}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                      <p className="text-gray-900">{formatDate(new Date(company.updatedAt))}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Driver Limit</label>
                      <p className="text-gray-900">{company.driverLimit} drivers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Spending Driver */}
              {stats?.topSpendingDriver && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Spending Driver</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{stats.topSpendingDriver.name}</h3>
                          <p className="text-sm text-gray-500">{stats.topSpendingDriver.email}</p>
                          <p className="text-lg font-bold text-primary-600">
                            {formatCurrency(stats.topSpendingDriver.totalSpent)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'drivers' && (
            <Card>
              <CardHeader>
                <CardTitle>All Drivers ({drivers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {drivers.length > 0 ? (
                  <div className="space-y-4">
                    {drivers.map((driver) => (
                      <div key={driver._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="font-semibold text-blue-600">
                              {driver.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                            <p className="text-sm text-gray-500">{driver.email}</p>
                            <p className="text-xs text-gray-400">
                              Created: {formatDate(new Date(driver.createdAt))}
                              {driver.lastActive && ` • Last active: ${formatDate(new Date(driver.lastActive))}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <Badge variant={getStatusColor(driver.status)}>
                              {driver.status}
                            </Badge>
                            {driver.assignedVehicleId && (
                              <p className="text-xs text-gray-500 mt-1">Vehicle Assigned</p>
                            )}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleViewDriver(driver)}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">👥</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No drivers found</h3>
                    <p className="text-gray-500">This company hasn't registered any drivers yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'vehicles' && (
            <Card>
              <CardHeader>
                <CardTitle>All Vehicles ({vehicles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {vehicles.length > 0 ? (
                  <div className="space-y-4">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M5 17H3v-2l1.5-5A1 1 0 0 1 5.5 9h13a1 1 0 0 1 .95.69L21 14v3h-2M7 9V6a4 4 0 0 1 8 0v3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {vehicle.licensePlate} • {vehicle.type}
                            </p>
                            <p className="text-xs text-gray-400">
                              Odometer: {vehicle.currentOdometer.toLocaleString()} km
                              {vehicle.assignedDriverId && ` • Assigned to driver`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <Badge variant={getStatusColor(vehicle.status)}>
                              {vehicle.status}
                            </Badge>
                            {vehicle.fuelType && (
                              <p className="text-xs text-gray-500 mt-1">{vehicle.fuelType}</p>
                            )}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleViewVehicle(vehicle)}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🚗</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
                    <p className="text-gray-500">This company hasn't registered any vehicles yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'expenses' && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses ({expenses.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {expenses.length > 0 ? (
                  <div className="space-y-4">
                    {expenses.map((expense) => {
                      // Handle both populated and unpopulated driverId
                      const driverId = expense.driverId;
                      const driver = typeof driverId === 'string'
                        ? drivers.find(d => d._id === driverId)
                        : driverId;
                      return (
                        <div key={expense._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              expense.type === 'FUEL' ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <svg className={`w-6 h-6 ${
                                expense.type === 'FUEL' ? 'text-blue-600' : 'text-gray-600'
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {expense.type === 'FUEL' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                )}
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {formatCurrency(expense.amountFinal)} • {expense.type}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {driver?.name || 'Unknown Driver'} • {formatDate(new Date(expense.date))}
                              </p>
                              {expense.category && (
                                <p className="text-xs text-gray-400">{expense.category}</p>
                              )}
                              {expense.merchant && (
                                <p className="text-xs text-gray-400">at {expense.merchant}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              {expense.kilometers && (
                                <p className="text-xs text-gray-500">{expense.kilometers} km</p>
                              )}
                              <p className="text-xs text-gray-400">
                                {formatDate(new Date(expense.createdAt))}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleViewExpense(expense)}>
                              View Details
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">💰</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
                    <p className="text-gray-500">This company hasn't submitted any expenses yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Driver Details Modal */}
      {showDriverModal && selectedDriver && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20"
          onClick={() => setShowDriverModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Driver Details</h2>
              <Button variant="outline" size="sm" onClick={() => setShowDriverModal(false)}>
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                  <p className="text-gray-900">{selectedDriver.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900">{selectedDriver.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    selectedDriver.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedDriver.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                  <p className="text-gray-900">{selectedDriver.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Driver ID</label>
                  <p className="font-mono text-sm text-gray-900">{selectedDriver._id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Created Date</label>
                  <p className="text-gray-900">{formatDate(new Date(selectedDriver.createdAt))}</p>
                </div>
              </div>
              {selectedDriver.assignedVehicleId && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Assigned Vehicle</label>
                  <p className="font-mono text-sm text-gray-900">{selectedDriver.assignedVehicleId}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Details Modal */}
      {showVehicleModal && selectedVehicle && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20"
          onClick={() => setShowVehicleModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Vehicle Details</h2>
              <Button variant="outline" size="sm" onClick={() => setShowVehicleModal(false)}>
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Make & Model</label>
                  <p className="text-gray-900">{selectedVehicle.make} {selectedVehicle.model}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Year</label>
                  <p className="text-gray-900">{selectedVehicle.year}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">License Plate</label>
                  <p className="font-mono text-gray-900">{selectedVehicle.licensePlate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                  <p className="text-gray-900">{selectedVehicle.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    selectedVehicle.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                    selectedVehicle.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedVehicle.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Current Odometer</label>
                  <p className="text-gray-900">{selectedVehicle.currentOdometer?.toLocaleString()} km</p>
                </div>
                {selectedVehicle.vin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">VIN</label>
                    <p className="font-mono text-sm text-gray-900">{selectedVehicle.vin}</p>
                  </div>
                )}
                {selectedVehicle.color && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Color</label>
                    <p className="text-gray-900">{selectedVehicle.color}</p>
                  </div>
                )}
                {selectedVehicle.fuelType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Fuel Type</label>
                    <p className="text-gray-900">{selectedVehicle.fuelType}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Vehicle ID</label>
                  <p className="font-mono text-sm text-gray-900">{selectedVehicle._id}</p>
                </div>
              </div>
              {selectedVehicle.assignedDriverId && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Assigned Driver</label>
                  <p className="text-gray-900">
                    {typeof selectedVehicle.assignedDriverId === 'object' && selectedVehicle.assignedDriverId && 'name' in selectedVehicle.assignedDriverId ?
                      (selectedVehicle.assignedDriverId as any).name :
                      selectedVehicle.assignedDriverId
                    }
                  </p>
                </div>
              )}
              {selectedVehicle.purchaseDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Purchase Date</label>
                  <p className="text-gray-900">{formatDate(new Date(selectedVehicle.purchaseDate))}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Created Date</label>
                <p className="text-gray-900">{formatDate(new Date(selectedVehicle.createdAt))}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense Details Modal */}
      {showExpenseModal && selectedExpense && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20"
          onClick={() => setShowExpenseModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Expense Details</h2>
              <Button variant="outline" size="sm" onClick={() => setShowExpenseModal(false)}>
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Amount</label>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedExpense.amountFinal)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    selectedExpense.type === 'FUEL' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedExpense.type}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                  <p className="text-gray-900">{formatDate(new Date(selectedExpense.date))}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Currency</label>
                  <p className="text-gray-900">{selectedExpense.currency}</p>
                </div>
                {selectedExpense.merchant && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Merchant</label>
                    <p className="text-gray-900">{selectedExpense.merchant}</p>
                  </div>
                )}
                {selectedExpense.category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                    <p className="text-gray-900">{selectedExpense.category}</p>
                  </div>
                )}
                {selectedExpense.kilometers && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Kilometers</label>
                    <p className="text-gray-900">{selectedExpense.kilometers} km</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Driver</label>
                  <p className="text-gray-900">
                    {(() => {
                      const driverId = selectedExpense.driverId;
                      if (!driverId) return 'Unknown Driver';

                      // If driverId is a string, find the driver
                      if (typeof driverId === 'string') {
                        const driver = drivers.find(d => d._id === driverId);
                        return driver?.name || 'Unknown Driver';
                      }

                      // If driverId is an object (populated), return the name
                      return (driverId as any).name || 'Unknown Driver';
                    })()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Expense ID</label>
                  <p className="font-mono text-sm text-gray-900">{selectedExpense._id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Created Date</label>
                  <p className="text-gray-900">{formatDate(new Date(selectedExpense.createdAt))}</p>
                </div>
              </div>
              {selectedExpense.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedExpense.notes}</p>
                </div>
              )}
              {selectedExpense.receiptUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Receipt</label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <img 
                      src={selectedExpense.receiptUrl} 
                      alt="Receipt" 
                      className="max-w-full h-auto rounded-lg cursor-pointer"
                      onClick={() => window.open(selectedExpense.receiptUrl, '_blank')}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}