'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import type { User, Vehicle } from '@/types';

interface AddExpenseModalProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  onLoadDrivers: (searchQuery: string) => Promise<User[]>;
  onLoadDriverVehicle: (driverId: string) => Promise<Vehicle | null>;
  onReceiptUpload: (file: File) => Promise<{ ocrData: any; receiptUrl: string }>;
  isCreating?: boolean;
}

export default function AddExpenseModal({
  onClose,
  onSubmit,
  onLoadDrivers,
  onLoadDriverVehicle,
  onReceiptUpload,
  isCreating = false,
}: AddExpenseModalProps) {
  const { t } = useTranslation('expenses');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [drivers, setDrivers] = useState<User[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<User | null>(null);
  const [selectedDriverVehicle, setSelectedDriverVehicle] = useState<Vehicle | null>(null);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');

  const [formData, setFormData] = useState({
    driverId: '',
    merchant: '',
    amountFinal: 0,
    currency: 'EUR',
    type: 'MISC',
    category: '',
    notes: '',
    kilometers: 0,
    odometerReading: 0,
    date: new Date().toISOString().split('T')[0],
    receiptFile: null as File | null,
    receiptUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1); // Multi-step form: 1 = Driver, 2 = Details, 3 = Review

  // Load drivers on mount
  useEffect(() => {
    loadDrivers('');
  }, []);

  // Load vehicle when driver is selected
  useEffect(() => {
    if (selectedDriver?._id) {
      loadDriverVehicle(selectedDriver._id);
    }
  }, [selectedDriver]);

  const loadDrivers = async (searchQuery: string) => {
    setLoadingDrivers(true);
    try {
      const result = await onLoadDrivers(searchQuery);
      setDrivers(result);
    } catch (error) {
      console.error('Error loading drivers:', error);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const loadDriverVehicle = async (driverId: string) => {
    setLoadingVehicle(true);
    try {
      const vehicle = await onLoadDriverVehicle(driverId);
      setSelectedDriverVehicle(vehicle);
    } catch (error) {
      console.error('Error loading vehicle:', error);
      setSelectedDriverVehicle(null);
    } finally {
      setLoadingVehicle(false);
    }
  };

  const handleReceiptUpload = async (file: File) => {
    setOcrProcessing(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const result = await onReceiptUpload(file);
      setOcrResult(result.ocrData);
      setFormData(prev => ({
        ...prev,
        receiptFile: file,
        receiptUrl: result.receiptUrl,
        merchant: result.ocrData?.merchant || prev.merchant,
        amountFinal: result.ocrData?.amount || prev.amountFinal,
        date: result.ocrData?.date || prev.date,
      }));
    } catch (error) {
      console.error('Error processing receipt:', error);
    } finally {
      setOcrProcessing(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.driverId) {
      newErrors.driverId = t('errors.validation.driverRequired');
    }
    if (!formData.merchant.trim()) {
      newErrors.merchant = t('errors.validation.merchantRequired');
    }
    if (!formData.amountFinal || formData.amountFinal <= 0) {
      newErrors.amountFinal = t('errors.validation.amountInvalid');
    }
    if (!formData.date) {
      newErrors.date = t('errors.validation.dateRequired');
    }

    // Odometer validation
    if (formData.odometerReading > 0 && selectedDriverVehicle?.currentOdometer) {
      if (formData.odometerReading < selectedDriverVehicle.currentOdometer) {
        newErrors.odometerReading = t('errors.validation.odometerTooLow', {
          newReading: formData.odometerReading,
          currentReading: selectedDriverVehicle.currentOdometer,
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const handleDriverSelect = (driver: User) => {
    setSelectedDriver(driver);
    setFormData({ ...formData, driverId: driver._id });
    setShowDriverDropdown(false);
    setDriverSearchQuery('');
    setStep(2); // Move to next step
  };

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name?.toLowerCase().includes(driverSearchQuery.toLowerCase()) ||
      driver.email?.toLowerCase().includes(driverSearchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={() => !isCreating && onClose()}
    >
      <div
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading Overlay */}
        {isCreating && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-20 rounded-2xl backdrop-blur-sm">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg">
              <div className="relative inline-block">
                <svg
                  className="animate-spin h-16 w-16 text-primary-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-primary-600 rounded-full animate-ping opacity-20"></div>
                </div>
              </div>
              <p className="text-xl text-primary-700 font-bold mt-6">{t('modal.creatingExpense')}</p>
              <p className="text-sm text-gray-600 mt-2">{t('modal.pleaseWait')}</p>
              <div className="mt-4 flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Header with Steps */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white p-6 rounded-t-2xl z-10 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('modal.addNewExpense')}
              </h2>
              <p className="text-primary-100 text-xs mt-0.5 ml-7">{t('modal.createForDriver')}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 hover:rotate-90"
              disabled={isCreating}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-3 mt-3">
            <div className={`flex items-center ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step >= 1 ? 'bg-white text-primary-600' : 'bg-white/30 text-white'}`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <span className="ml-1.5 text-sm font-medium hidden sm:inline">{t('modal.stepDriver')}</span>
            </div>
            <div className={`h-0.5 w-10 rounded ${step >= 2 ? 'bg-white' : 'bg-white/30'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step >= 2 ? 'bg-white text-primary-600' : 'bg-white/30 text-white'}`}>
                {step > 2 ? '✓' : '2'}
              </div>
              <span className="ml-1.5 text-sm font-medium hidden sm:inline">{t('modal.stepDetails')}</span>
            </div>
            <div className={`h-0.5 w-10 rounded ${step >= 3 ? 'bg-white' : 'bg-white/30'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step >= 3 ? 'bg-white text-primary-600' : 'bg-white/30 text-white'}`}>
                3
              </div>
              <span className="ml-1.5 text-sm font-medium hidden sm:inline">{t('modal.stepReview')}</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Step 1: Driver Selection */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">{t('modal.selectDriverTitle')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('modal.selectDriverSubtitle')}</p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={selectedDriver?.name || driverSearchQuery}
                      onChange={(e) => {
                        setDriverSearchQuery(e.target.value);
                        setShowDriverDropdown(true);
                        loadDrivers(e.target.value);
                      }}
                      onFocus={() => setShowDriverDropdown(true)}
                      placeholder={t('modal.searchDrivers')}
                      className={`w-full pl-10 pr-4 py-3 text-base border-2 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-all ${
                        errors.driverId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isCreating}
                      autoFocus
                    />
                    {errors.driverId && (
                      <p className="text-sm text-red-600 mt-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.driverId}
                      </p>
                    )}

                    {/* Driver Dropdown */}
                    {showDriverDropdown && (
                      <div className="absolute z-30 mt-2 w-full bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                        {loadingDrivers ? (
                          <div className="p-6 text-center">
                            <svg className="animate-spin h-6 w-6 text-primary-600 mx-auto" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className="text-sm text-gray-500 mt-2">{t('modal.loadingDrivers')}</p>
                          </div>
                        ) : filteredDrivers.length > 0 ? (
                          <>
                            {filteredDrivers.map((driver) => (
                              <button
                                key={driver._id}
                                type="button"
                                onClick={() => handleDriverSelect(driver)}
                                className="w-full px-4 py-3 text-left hover:bg-primary-50 transition-all border-b last:border-b-0 flex items-center space-x-3 group"
                              >
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-base shadow-md group-hover:scale-105 transition-transform">
                                  {driver.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900 text-base">{driver.name}</div>
                                  <div className="text-xs text-gray-600">{driver.email}</div>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            ))}
                            <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-t">
                              {t('modal.foundDrivers', { count: filteredDrivers.length, plural: filteredDrivers.length !== 1 ? 's' : '' })}
                              {driverSearchQuery && t('modal.matchingDrivers', { query: driverSearchQuery })}
                            </div>
                          </>
                        ) : (
                          <div className="p-6 text-center">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-sm text-gray-500">{t('modal.noDriversFoundMessage')}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Expense Details */}
            {step === 2 && selectedDriver && (
              <div className="space-y-4 animate-fadeIn">
                {/* Driver & Vehicle Info Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {selectedDriver.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-gray-900">{selectedDriver.name}</h4>
                        <p className="text-xs text-gray-600">{selectedDriver.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setSelectedDriver(null);
                        setSelectedDriverVehicle(null);
                        setFormData({ ...formData, driverId: '' });
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center"
                    >
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                      </svg>
                      {t('modal.changeDriver')}
                    </button>
                  </div>

                  {/* Vehicle Info */}
                  {loadingVehicle ? (
                    <div className="mt-4 p-4 bg-white rounded-lg animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ) : selectedDriverVehicle ? (
                    <div className="mt-3 bg-white p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                          </svg>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">
                              {selectedDriverVehicle.make} {selectedDriverVehicle.model} ({selectedDriverVehicle.year})
                            </p>
                            <p className="text-xs text-gray-600">{selectedDriverVehicle.licensePlate}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-medium">Odometer</p>
                          <p className="text-lg font-bold text-blue-600">{selectedDriverVehicle.currentOdometer?.toLocaleString()} km</p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Receipt Upload */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {t('modal.receiptOptional')}
                    {ocrProcessing && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        <svg className="animate-spin -ml-0.5 mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {t('modal.processingOcr')}
                      </span>
                    )}
                  </label>

                  <div className="flex items-center space-x-3">
                    {receiptPreview ? (
                      <div className="flex-shrink-0">
                        <img
                          src={receiptPreview}
                          alt="Receipt preview"
                          className="w-20 h-20 object-cover rounded-lg border border-purple-300 shadow-sm"
                        />
                      </div>
                    ) : null}

                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            await handleReceiptUpload(file);
                          }
                        }}
                        className="hidden"
                        disabled={isCreating || ocrProcessing}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-6 py-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-100 transition-all flex items-center justify-center space-x-3 group"
                        disabled={isCreating || ocrProcessing}
                      >
                        <svg className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-purple-700 font-semibold">
                          {receiptPreview ? t('modal.changeReceipt') : t('modal.uploadReceipt')}
                        </span>
                      </button>
                      {ocrResult && (
                        <p className="text-sm text-green-600 font-semibold mt-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {t('modal.ocrProcessed', { confidence: ocrResult.confidence })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Merchant */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t('modal.merchantLabel')} <span className="text-red-500">*</span>
                      {ocrResult?.merchant && (
                        <span className="ml-2 text-xs text-purple-600 font-normal">✨ {t('modal.ocrExtractedLabel')}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.merchant}
                      onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary-300 transition-all ${
                        errors.merchant ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'
                      }`}
                      placeholder="e.g., Shell Gas Station"
                      disabled={isCreating}
                    />
                    {errors.merchant && <p className="text-sm text-red-600 mt-1">{errors.merchant}</p>}
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
                      disabled={isCreating}
                      className={errors.date ? 'border-red-500' : ''}
                    />
                    {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date}</p>}
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t('modal.amountLabel')} <span className="text-red-500">*</span>
                      {ocrResult?.amount && (
                        <span className="ml-2 text-xs text-purple-600 font-normal">✨ {t('modal.ocrExtractedLabel')}</span>
                      )}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500 font-bold text-lg">€</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amountFinal}
                        onChange={(e) => setFormData({ ...formData, amountFinal: parseFloat(e.target.value) || 0 })}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary-300 transition-all text-lg font-semibold ${
                          errors.amountFinal ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'
                        }`}
                        placeholder="0.00"
                        disabled={isCreating}
                      />
                    </div>
                    {errors.amountFinal && <p className="text-sm text-red-600 mt-1">{errors.amountFinal}</p>}
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t('modal.currencyLabel')}
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-all"
                      disabled={isCreating}
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t('modal.typeLabel')}
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-all"
                      disabled={isCreating}
                    >
                      <option value="FUEL">{t('types.FUEL')}</option>
                      <option value="MISC">{t('types.MISC')}</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t('modal.categoryLabel')}
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-all"
                      disabled={isCreating}
                    >
                      <option value="">{t('modal.selectCategoryOptional')}</option>
                      <option value="TOLL">{t('categories.TOLL')}</option>
                      <option value="PARKING">{t('categories.PARKING')}</option>
                      <option value="REPAIR">{t('categories.REPAIR')}</option>
                      <option value="OTHER">{t('categories.OTHER')}</option>
                    </select>
                  </div>

                  {/* Odometer Reading */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t('modal.odometerReading')}
                      {selectedDriverVehicle && (
                        <span className="ml-2 text-xs text-blue-600 font-normal">
                          {t('modal.current')}: {selectedDriverVehicle.currentOdometer?.toLocaleString()} km
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.odometerReading || ''}
                        onChange={(e) => setFormData({ ...formData, odometerReading: parseInt(e.target.value) || 0 })}
                        placeholder={selectedDriverVehicle?.currentOdometer?.toString() || '0'}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary-300 transition-all ${
                          errors.odometerReading ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'
                        }`}
                        disabled={isCreating}
                      />
                      <span className="absolute right-4 top-3 text-gray-500 font-semibold">km</span>
                    </div>
                    {errors.odometerReading && <p className="text-sm text-red-600 mt-1">{errors.odometerReading}</p>}
                    {selectedDriverVehicle && (
                      <p className="text-xs text-gray-500 mt-1">{t('modal.odometerHelperText')}</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t('modal.notes')}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    placeholder={t('modal.enterNotesOptional')}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 resize-none transition-all"
                    disabled={isCreating}
                  />
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isCreating}
                    className="flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t('modal.back')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="flex items-center px-8 py-3 text-lg"
                  >
                    {isCreating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {t('modal.creating')}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {t('modal.createExpense')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-8 py-4 border-t-2 border-gray-200 rounded-b-2xl flex justify-between items-center">
          <p className="text-sm text-gray-500">
            <span className="text-red-500">*</span> {t('modal.requiredFields')}
          </p>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isCreating}
            className="text-gray-600 hover:text-gray-900"
          >
            {t('modal.cancel')}
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
