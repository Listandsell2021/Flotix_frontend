'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import { formatDate } from '@/lib/utils';
import type { User, Expense } from '@/types';

interface ExpenseWithDriver extends Omit<Expense, 'driverId'> {
  driverId: User | string;
}

interface ExpenseEditModalProps {
  expense: ExpenseWithDriver;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  isSaving?: boolean;
}

export default function ExpenseEditModal({
  expense,
  onClose,
  onSave,
  isSaving = false,
}: ExpenseEditModalProps) {
  const { t } = useTranslation('expenses');
  const [formData, setFormData] = useState({
    merchant: expense.merchant || '',
    amountFinal: expense.amountFinal || 0,
    currency: 'EUR', // Fixed to EUR
    type: expense.type || 'MISC',
    category: expense.category || '',
    notes: expense.notes || '',
    kilometers: expense.kilometers || 0,
    odometerReading: expense.odometerReading || 0,
    date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.merchant.trim()) {
      newErrors.merchant = t('errors.validation.merchantRequired');
    }
    if (!formData.amountFinal || formData.amountFinal <= 0) {
      newErrors.amountFinal = t('errors.validation.amountInvalid');
    }
    if (!formData.date) {
      newErrors.date = t('errors.validation.dateRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    await onSave(formData);
  };

  const getDriverName = (driverId: User | string): string => {
    if (typeof driverId === 'string') return t('modal.unknown');
    return driverId?.name || t('modal.unknown');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl transform transition-all animate-in max-h-[90vh] flex flex-col">
        {/* Modern Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white px-6 py-4 rounded-t-2xl flex-shrink-0">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl transform -translate-x-24 translate-y-24"></div>
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">{t('modal.editExpense')}</h2>
                <p className="text-primary-100 text-xs flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {getDriverName(expense.driverId)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-all hover:scale-110 active:scale-95"
              disabled={isSaving}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content with Professional Layout */}
        <div className="overflow-y-auto flex-1 p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
            {/* Primary Information Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {t('modal.expenseDetails')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Merchant */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('modal.merchantLabel')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={formData.merchant}
                      onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                        errors.merchant ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Enter merchant name"
                      disabled={isSaving}
                    />
                  </div>
                  {errors.merchant && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {errors.merchant}
                    </p>
                  )}
                </div>

                {/* Amount with EUR fixed */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('modal.amountLabel')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-semibold">€</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amountFinal}
                      onChange={(e) => setFormData({ ...formData, amountFinal: parseFloat(e.target.value) })}
                      className={`w-full pl-9 pr-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                        errors.amountFinal ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="0.00"
                      disabled={isSaving}
                    />
                  </div>
                  {errors.amountFinal && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {errors.amountFinal}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <DatePicker
                    mode="single"
                    value={formData.date}
                    onChange={(value) => setFormData({ ...formData, date: value as string })}
                    label={
                      <>
                        {t('modal.dateLabel')} <span className="text-red-500">*</span>
                      </>
                    }
                    disabled={isSaving}
                    className={errors.date ? 'border-red-500 bg-red-50' : ''}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {errors.date}
                    </p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('modal.typeLabel')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-300 transition-all appearance-none bg-white"
                      disabled={isSaving}
                    >
                      <option value="FUEL">{t('types.FUEL')}</option>
                      <option value="MISC">{t('types.MISC')}</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('modal.categoryLabel')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-300 transition-all appearance-none bg-white"
                      disabled={isSaving}
                    >
                      <option value="">{t('modal.selectCategoryOptional')}</option>
                      <option value="TOLL">{t('categories.TOLL')}</option>
                      <option value="PARKING">{t('categories.PARKING')}</option>
                      <option value="REPAIR">{t('categories.REPAIR')}</option>
                      <option value="OTHER">{t('categories.OTHER')}</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </div>
                {t('modal.vehicleLabel')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kilometers */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('modal.kilometersLabel')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.kilometers}
                      onChange={(e) => setFormData({ ...formData, kilometers: parseFloat(e.target.value) || 0 })}
                      placeholder={t('modal.enterKilometersOptional')}
                      className="w-full pl-10 pr-12 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-300 transition-all"
                      disabled={isSaving}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-sm font-medium">km</span>
                    </div>
                  </div>
                </div>

                {/* Odometer Reading */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('modal.odometerReading')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      type="number"
                      value={formData.odometerReading}
                      onChange={(e) => setFormData({ ...formData, odometerReading: parseInt(e.target.value) || 0 })}
                      placeholder={t('modal.enterOdometerOptional')}
                      className="w-full pl-10 pr-12 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-300 transition-all"
                      disabled={isSaving}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-sm font-medium">km</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                {t('modal.notes')}
              </h3>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder={t('modal.enterNotesOptional')}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-300 transition-all resize-none"
                disabled={isSaving}
              />
            </div>

            {/* Receipt Image Section */}
            {expense.receiptUrl && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {t('modal.receiptImage')}
                </h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-gray-200">
                  <img
                    src={expense.receiptUrl}
                    alt={t('modal.receiptAlt')}
                    className="max-w-full h-auto max-h-60 rounded-lg shadow-lg mx-auto object-contain"
                  />
                </div>
              </div>
            )}
            </div>
          </form>
        </div>

        {/* Modern Footer with Actions */}
        <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex items-center justify-between rounded-b-2xl flex-shrink-0">
          <div className="text-sm text-gray-500">
            <span className="text-red-500">*</span> {t('modal.requiredFields')}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2.5"
            >
              {t('modal.cancel')}
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-8 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('modal.creating')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('modal.saveChanges')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
