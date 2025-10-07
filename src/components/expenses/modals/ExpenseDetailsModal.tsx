'use client';

import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { User, Expense, Vehicle } from '@/types';

interface ExpenseWithDriver extends Omit<Expense, 'driverId'> {
  driverId: User | string;
}

interface ExpenseDetailsModalProps {
  expense: ExpenseWithDriver;
  vehicle: Vehicle | null;
  loadingVehicle?: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export default function ExpenseDetailsModal({
  expense,
  vehicle,
  loadingVehicle,
  onClose,
  onEdit,
}: ExpenseDetailsModalProps) {
  const { t } = useTranslation('expenses');

  const getDriverName = (driverId: User | string): string => {
    if (typeof driverId === 'string') return t('modal.unknown');
    return driverId?.name || t('modal.unknown');
  };

  const getDriverEmail = (driverId: User | string): string => {
    if (typeof driverId === 'string') return '';
    return driverId?.email || '';
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white p-6 rounded-t-2xl z-10 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">{t('modal.expenseDetails')}</h2>
                <p className="text-primary-100 text-xs mt-0.5 flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {expense.merchant || t('modal.unknownMerchant')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 hover:rotate-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)] p-6">
          {/* Amount Highlight */}
          <div className="bg-gradient-to-br from-primary-50 via-primary-100 to-indigo-100 p-5 rounded-xl border-2 border-primary-200 shadow-md mb-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-primary-700 uppercase tracking-wide flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('modal.amount')}
                </label>
                <div className="flex items-baseline mt-1.5 space-x-1.5">
                  <p className="text-3xl font-bold text-primary-900">
                    {formatCurrency(expense.amountFinal)}
                  </p>
                  <span className="text-lg font-semibold text-primary-700">{expense.currency}</span>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1.5">
                <Badge variant={expense.type === 'FUEL' ? 'primary' : 'secondary'} className="text-sm px-3 py-1 font-semibold">
                  {t(`types.${expense.type}`)}
                </Badge>
                {expense.category && (
                  <span className="text-xs font-semibold text-primary-700 bg-white px-2.5 py-1 rounded-full">
                    {t(`categories.${expense.category}`)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Merchant */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {t('modal.merchant')}
              </label>
              <p className="text-base font-semibold text-gray-900 mt-1.5">
                {expense.merchant || t('modal.unknownMerchant')}
              </p>
            </div>

            {/* Date */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t('modal.date')}
              </label>
              <p className="text-base font-semibold text-gray-900 mt-1.5">
                {formatDate(expense.date)}
              </p>
            </div>

            {/* Driver */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 shadow-sm hover:shadow transition-shadow">
              <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide flex items-center">
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t('modal.driver')}
              </label>
              <p className="text-base font-semibold text-gray-900 mt-1.5">
                {getDriverName(expense.driverId)}
              </p>
              {getDriverEmail(expense.driverId) && (
                <p className="text-xs text-gray-600 mt-0.5">
                  {getDriverEmail(expense.driverId)}
                </p>
              )}
            </div>
          </div>

          {/* Vehicle Information */}
          {loadingVehicle ? (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200 animate-pulse mb-6">
              <div className="h-3 bg-indigo-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-indigo-200 rounded w-2/3"></div>
            </div>
          ) : vehicle ? (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200 shadow-sm hover:shadow transition-shadow mb-6">
              <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide flex items-center">
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                {t('modal.vehicle')}
              </label>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <p className="text-base font-semibold text-indigo-900">
                    {vehicle.make} {vehicle.model}
                  </p>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <span className="text-xs font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-full">
                      {vehicle.year}
                    </span>
                    <span className="text-xs font-semibold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-full">
                      {vehicle.licensePlate}
                    </span>
                  </div>
                </div>
                {vehicle.currentOdometer && (
                  <div className="text-right">
                    <p className="text-xs text-indigo-600 font-semibold">Odometer</p>
                    <p className="text-lg font-bold text-indigo-900">{vehicle.currentOdometer?.toLocaleString()} km</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Additional Details */}
          {(expense.odometerReading || expense.notes) && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Additional Details
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {expense.odometerReading ? (
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200 shadow-sm hover:shadow transition-shadow">
                    <label className="text-xs font-semibold text-orange-700 uppercase tracking-wide flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {t('modal.odometerReading')}
                    </label>
                    <div className="flex items-baseline mt-1.5 space-x-1">
                      <p className="text-lg font-bold text-orange-900">
                        {expense.odometerReading?.toLocaleString()}
                      </p>
                      <span className="text-sm font-semibold text-orange-700">km</span>
                    </div>
                  </div>
                ) : null}

                {expense.notes && (
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow lg:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      {t('modal.notes')}
                    </label>
                    <p className="text-gray-900 mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                      {expense.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OCR Details */}
          {expense.ocrData && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('modal.ocrDetails')}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200 shadow-sm hover:shadow transition-shadow">
                  <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('modal.ocrAmount')}
                  </label>
                  <p className="text-base font-bold text-purple-900 mt-1.5">
                    {formatCurrency(expense.ocrData.amount || 0)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200 shadow-sm hover:shadow transition-shadow">
                  <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {t('modal.ocrConfidence')}
                  </label>
                  <div className="flex items-baseline mt-1.5 space-x-1">
                    <p className="text-base font-bold text-purple-900">
                      {expense.ocrData.confidence}
                    </p>
                    <span className="text-sm font-semibold text-purple-700">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Receipt Image */}
          {expense.receiptUrl && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t('modal.receiptImage')}
              </h3>
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-4 rounded-lg border border-gray-300 shadow-sm">
                <div className="relative group">
                  <img
                    src={expense.receiptUrl}
                    alt={t('modal.receiptAlt')}
                    className="max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 group-hover:scale-[1.01]"
                    onClick={() => window.open(expense.receiptUrl, '_blank')}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-90 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center justify-center mt-3 space-x-1.5">
                  <svg className="w-3.5 h-3.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <p className="text-xs font-medium text-gray-600">
                    {t('modal.clickToViewFullSize')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-600 mb-3 flex items-center uppercase tracking-wide">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('modal.timestamps')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    {t('modal.created')}
                  </label>
                  <p className="text-xs font-medium text-gray-900">
                    {formatDate(expense.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    {t('modal.lastUpdated')}
                  </label>
                  <p className="text-xs font-medium text-gray-900">
                    {formatDate(expense.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center rounded-b-2xl">
          <p className="text-xs text-gray-500 font-medium">
            {expense.canEdit && (
              <span className="inline-flex items-center text-green-600">
                <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Editable
              </span>
            )}
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="px-4 text-sm">
              {t('modal.close')}
            </Button>
            {onEdit && expense.canEdit && (
              <Button onClick={onEdit} className="px-4 text-sm">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t('modal.edit')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
