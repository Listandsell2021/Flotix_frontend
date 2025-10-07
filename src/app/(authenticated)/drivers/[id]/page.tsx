'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { usersApi, expensesApi, vehiclesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { formatCurrency } from '@/lib/utils';
import type { User, Vehicle } from '@/types';

export default function DriverDetailsPage() {
  const { t } = useTranslation('users');
  const params = useParams();
  const router = useRouter();
  const driverId = params.id as string;
  
  const [driver, setDriver] = useState<User | null>(null);
  const [assignedVehicle, setAssignedVehicle] = useState<Vehicle | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [error, setError] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    if (driverId) {
      loadDriverData();
      loadDriverExpenses();
    }
  }, [driverId]);

  const loadDriverData = async () => {
    try {
      const response = await usersApi.getUser(driverId);
      if (response.success && response.data) {
        const driverData = response.data;
        setDriver(driverData);
        
        // Load assigned vehicle if exists
        if (driverData.assignedVehicleId) {
          try {
            const vehicleResponse = await vehiclesApi.getVehicle(driverData.assignedVehicleId?._id);
            if (vehicleResponse.success && vehicleResponse.data) {
              setAssignedVehicle(vehicleResponse.data);
            }
          } catch (vehicleErr) {
            console.error('Failed to load assigned vehicle:', vehicleErr);
          }
        }
      } else {
        setError(t('driverDetails.driverNotFound'));
      }
    } catch (err: any) {
      setError(err.message || t('driverDetails.failedToLoadDriverData'));
    } finally {
      setLoading(false);
    }
  };

  const loadDriverExpenses = async () => {
    try {
      const response = await expensesApi.getExpenses({ 
        driverId,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 100
      });
      
      if (response.success && response.data) {
        setExpenses(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load driver expenses:', err);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const getTranslatedStatus = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return t('filters.active');
      case 'INACTIVE':
        return t('filters.inactive');
      case 'SUSPENDED':
        return t('filters.suspended', 'Suspended');
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'suspended':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const openPhotoModal = (expense: any) => {
    setSelectedExpense(expense);
    setShowPhotoModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">{t('driverDetails.loadingDriverDetails')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">{t('driverDetails.error')}</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={() => router.back()}>
              {t('driverDetails.goBack')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amountFinal || 0), 0);
  const fuelExpenses = expenses.filter(e => e.type === 'FUEL');
  const miscExpenses = expenses.filter(e => e.type === 'MISC');

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
              {t('driverDetails.backToDrivers')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('driverDetails.title')}</h1>
              <p className="text-gray-600 mt-1">{t('driverDetails.completeOverview', { name: driver.name })}</p>
            </div>
          </div>
        </div>

        {/* Driver Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-primary-700 font-semibold text-xl">
                  {driver.name.charAt(0).toUpperCase()}
                </span>
              </div>
              {t('driverDetails.driverInformation')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{driver.name}</h3>
                <p className="text-gray-600">{driver.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('driverDetails.status')}</label>
                <Badge variant={getStatusColor(driver.status)}>
                  {getTranslatedStatus(driver.status)}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('driverDetails.role')}</label>
                <p className="text-gray-900">{driver.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('driverDetails.joined')}</label>
                <p className="text-gray-900">{new Date(driver.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
              </div>
            </div>
            
            {/* Vehicle Information */}
            {assignedVehicle && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">{t('driverDetails.assignedVehicle')}</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">
                      {assignedVehicle.type === 'CAR' ? '🚗' : 
                       assignedVehicle.type === 'TRUCK' ? '🚛' :
                       assignedVehicle.type === 'VAN' ? '🚐' :
                       assignedVehicle.type === 'MOTORCYCLE' ? '🏍️' : '🚗'}
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {assignedVehicle.make} {assignedVehicle.model} ({assignedVehicle.year})
                          </p>
                          <p className="text-sm text-gray-600">{t('driverDetails.license')}: {assignedVehicle.licensePlate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{t('driverDetails.currentOdometer')}</p>
                          <p className="font-semibold text-gray-900">{assignedVehicle.currentOdometer.toLocaleString()} km</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{t('driverDetails.vehicleDetails')}</p>
                          <p className="text-sm text-gray-900">
                            {assignedVehicle.type} • {assignedVehicle.fuelType || 'N/A'}
                            {assignedVehicle.color && ` • ${assignedVehicle.color}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('driverDetails.totalExpenses')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalExpenses, expenses[0]?.currency || 'EUR')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{t('driverDetails.totalExpensesCount', { count: expenses.length })}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('driverDetails.fuelExpenses')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      fuelExpenses.reduce((sum, e) => sum + (e.amountFinal || 0), 0),
                      expenses[0]?.currency || 'EUR'
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⛽</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{t('driverDetails.fuelExpensesCount', { count: fuelExpenses.length })}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('driverDetails.otherExpenses')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      miscExpenses.reduce((sum, e) => sum + (e.amountFinal || 0), 0),
                      expenses[0]?.currency || 'EUR'
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📄</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{t('driverDetails.otherExpensesCount', { count: miscExpenses.length })}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('driverDetails.assignedVehicle')}</p>
                  {assignedVehicle ? (
                    <>
                      <p className="text-xl font-bold text-blue-600">
                        {assignedVehicle.make} {assignedVehicle.model}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {assignedVehicle.licensePlate} • {assignedVehicle.currentOdometer.toLocaleString()} km
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xl font-bold text-gray-400">{t('driverDetails.noVehicle')}</p>
                      <p className="text-sm text-gray-500 mt-1">{t('driverDetails.notAssignedToVehicle')}</p>
                    </>
                  )}
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  {assignedVehicle ? (
                    <span className="text-2xl">
                      {assignedVehicle.type === 'CAR' ? '🚗' : 
                       assignedVehicle.type === 'TRUCK' ? '🚛' :
                       assignedVehicle.type === 'VAN' ? '🚐' :
                       assignedVehicle.type === 'MOTORCYCLE' ? '🏍️' : '🚗'}
                    </span>
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8m-4 4v-8M9 5l3-3 3 3m-6 10l3 3 3-3" />
                    </svg>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expenses List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('driverDetails.allExpenses', { count: expenses.length })}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingExpenses ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className="mt-4 text-gray-600">{t('driverDetails.loadingExpenses')}</p>
                </div>
              </div>
            ) : expenses.length > 0 ? (
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div key={expense._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 text-lg">
                          {expense.type === 'FUEL' ? '⛽' : '📄'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {expense.merchant || t('driverDetails.expenseType', { type: expense.type })}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(expense.date || expense.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} • {expense.type}
                          {expense.category && ` • ${expense.category}`}
                          {expense.kilometers && ` • ${expense.kilometers} km`}
                          {assignedVehicle && ` • ${assignedVehicle.licensePlate}`}
                        </p>
                        {assignedVehicle && (
                          <p className="text-xs text-blue-600 mt-1">
                            🚗 {assignedVehicle.make} {assignedVehicle.model}
                            {expense.odometerReading && ` • ${t('driverDetails.odometer')}: ${expense.odometerReading.toLocaleString()} km`}
                          </p>
                        )}
                        {expense.notes && (
                          <p className="text-sm text-gray-600 mt-1">{expense.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(expense.amountFinal, expense.currency)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(expense.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPhotoModal(expense)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {t('driverDetails.viewReceipt')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('driverDetails.noExpensesFound')}</h3>
                <p className="text-gray-500">{t('driverDetails.noExpensesMessage')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Receipt Photo Modal */}
        {showPhotoModal && selectedExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center z-50 p-4 pt-20">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('driverDetails.receiptPhoto')}</h3>
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('driverDetails.expenseDetails')}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">{t('driverDetails.merchant')}:</span>
                      <span className="ml-2 text-gray-900">{selectedExpense.merchant || t('driverDetails.na')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('driverDetails.amount')}:</span>
                      <span className="ml-2 text-gray-900 font-semibold">
                        {formatCurrency(selectedExpense.amountFinal, selectedExpense.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('driverDetails.date')}:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(selectedExpense.date || selectedExpense.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('driverDetails.type')}:</span>
                      <span className="ml-2 text-gray-900">{selectedExpense.type}</span>
                    </div>
                    {selectedExpense.category && (
                      <div>
                        <span className="text-gray-600">{t('driverDetails.category')}:</span>
                        <span className="ml-2 text-gray-900">{selectedExpense.category}</span>
                      </div>
                    )}
                    {selectedExpense.kilometers && (
                      <div>
                        <span className="text-gray-600">{t('driverDetails.kilometers')}:</span>
                        <span className="ml-2 text-gray-900">{selectedExpense.kilometers} km</span>
                      </div>
                    )}
                    {selectedExpense.odometerReading && (
                      <div>
                        <span className="text-gray-600">{t('driverDetails.odometerReading')}:</span>
                        <span className="ml-2 text-gray-900">{selectedExpense.odometerReading.toLocaleString()} km</span>
                      </div>
                    )}
                    {assignedVehicle && (
                      <div>
                        <span className="text-gray-600">{t('driverDetails.vehicle')}:</span>
                        <span className="ml-2 text-gray-900">
                          {assignedVehicle.make} {assignedVehicle.model} ({assignedVehicle.licensePlate})
                        </span>
                      </div>
                    )}
                  </div>
                  {selectedExpense.notes && (
                    <div className="mt-3">
                      <span className="text-gray-600">{t('driverDetails.notes')}:</span>
                      <p className="mt-1 text-gray-900">{selectedExpense.notes}</p>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <img
                    src={selectedExpense.receiptUrl}
                    alt={t('driverDetails.receipt')}
                    className="max-w-full h-auto rounded-lg shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const errorDiv = document.createElement('div');
                      errorDiv.className = 'bg-gray-100 p-8 rounded-lg text-center';
                      errorDiv.innerHTML = `
                        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <p class="text-gray-500">${t('driverDetails.unableToLoadReceipt')}</p>
                        <p class="text-sm text-gray-400 mt-1">${t('driverDetails.imageMayBeDeleted')}</p>
                      `;
                      target.parentNode?.appendChild(errorDiv);
                    }}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowPhotoModal(false)}>
                    {t('driverDetails.close')}
                  </Button>
                  <Button 
                    onClick={() => window.open(selectedExpense.receiptUrl, '_blank')}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {t('driverDetails.openInNewTab')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}