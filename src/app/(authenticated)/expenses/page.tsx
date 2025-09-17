'use client';

import { useEffect, useState } from 'react';
import { expensesApi, vehiclesApi, usersApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { TableSkeleton, CardSkeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import type { Expense, User, Vehicle } from '@fleetflow/types';

// Expense with populated driver info
interface ExpenseWithDriver extends Omit<Expense, 'driverId'> {
  driverId: User | string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseWithDriver[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseWithDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'merchant' | 'driver'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithDriver | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState<Vehicle | null>(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [showFullSizeImage, setShowFullSizeImage] = useState(false);
  const [editFormData, setEditFormData] = useState({
    merchant: '',
    amountFinal: 0,
    currency: '',
    type: '',
    category: '',
    notes: '',
    kilometers: 0,
    date: ''
  });
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<User | null>(null);
  const [selectedDriverVehicle, setSelectedDriverVehicle] = useState<Vehicle | null>(null);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [addFormData, setAddFormData] = useState({
    driverId: '',
    merchant: '',
    amountFinal: 0,
    currency: 'EUR',
    type: 'MISC',
    category: '',
    notes: '',
    kilometers: 0,
    date: new Date().toISOString().split('T')[0],
    receiptFile: null as File | null,
    receiptUrl: ''
  });
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [exportingData, setExportingData] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  // Filter and sort expenses when any filter or sort option changes
  useEffect(() => {
    filterAndSortExpenses();
  }, [expenses, searchQuery, dateFromFilter, dateToFilter, typeFilter, sortBy, sortOrder]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFromFilter, dateToFilter, typeFilter]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.relative')) {
        setShowFilterDropdown(false);
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load vehicle info when expense modal opens
  useEffect(() => {
    if (showExpenseModal && selectedExpense?.vehicleId) {
      console.log('Vehicle ID in expense:', {
        vehicleId: selectedExpense.vehicleId,
        type: typeof selectedExpense.vehicleId,
        isObject: typeof selectedExpense.vehicleId === 'object'
      });

      // Check if vehicleId is already populated as an object
      if (typeof selectedExpense.vehicleId === 'object' && selectedExpense.vehicleId !== null) {
        // Vehicle data is already populated from the API
        console.log('Using populated vehicle data:', selectedExpense.vehicleId);
        setVehicleInfo(selectedExpense.vehicleId as any);
        setLoadingVehicle(false);
      } else if (typeof selectedExpense.vehicleId === 'string') {
        // Vehicle is just an ID, need to fetch details
        console.log('Fetching vehicle details for ID:', selectedExpense.vehicleId);
        loadVehicleInfo(selectedExpense.vehicleId);
      }
    } else {
      setVehicleInfo(null);
    }
  }, [showExpenseModal, selectedExpense?.vehicleId]);

  // Populate edit form when entering edit mode
  useEffect(() => {
    if (isEditMode && selectedExpense) {
      setEditFormData({
        merchant: selectedExpense.merchant || '',
        amountFinal: selectedExpense.amountFinal || 0,
        currency: selectedExpense.currency || 'EUR',
        type: selectedExpense.type || 'MISC',
        category: selectedExpense.category || '',
        notes: selectedExpense.notes || '',
        kilometers: selectedExpense.kilometers || 0,
        date: new Date(selectedExpense.date).toISOString().split('T')[0]
      });
    }
  }, [isEditMode, selectedExpense]);

  const filterAndSortExpenses = () => {
    let filtered = expenses;

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((expense) => {
        // Search in merchant/title
        const merchantMatch = (expense.merchant || '').toLowerCase().includes(query);
        
        // Search in driver name
        const driverName = typeof expense.driverId === 'object' && expense.driverId?.name 
          ? expense.driverId.name.toLowerCase() 
          : '';
        const driverMatch = driverName.includes(query);
        
        // Search in expense type and category
        const typeMatch = expense.type.toLowerCase().includes(query);
        const categoryMatch = (expense.category || '').toLowerCase().includes(query);
        
        return merchantMatch || driverMatch || typeMatch || categoryMatch;
      });
    }

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter((expense) => expense.type === typeFilter);
    }

    // Apply date filters
    if (dateFromFilter) {
      const fromDate = new Date(dateFromFilter);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((expense) => {
        const expenseDate = new Date(expense.date);
        expenseDate.setHours(0, 0, 0, 0);
        return expenseDate >= fromDate;
      });
    }

    if (dateToFilter) {
      const toDate = new Date(dateToFilter);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate <= toDate;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'amount':
          aValue = a.amountFinal || 0;
          bValue = b.amountFinal || 0;
          break;
        case 'merchant':
          aValue = (a.merchant || '').toLowerCase();
          bValue = (b.merchant || '').toLowerCase();
          break;
        case 'driver':
          aValue = typeof a.driverId === 'object' && a.driverId?.name 
            ? a.driverId.name.toLowerCase() 
            : '';
          bValue = typeof b.driverId === 'object' && b.driverId?.name 
            ? b.driverId.name.toLowerCase() 
            : '';
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredExpenses(filtered);
  };

  const loadExpenses = async () => {
    try {
      const response = await expensesApi.getExpenses();
      if (response.success && response.data) {
        // API returns paginated response: { data: Expense[], pagination: {...} }
        setExpenses(response.data.data || []);
      } else {
        setError(response.message || 'Failed to load expenses');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const loadVehicleInfo = async (vehicleId: string) => {
    if (!vehicleId) return;
    
    setLoadingVehicle(true);
    try {
      const response = await vehiclesApi.getVehicle(vehicleId);
      if (response.success && response.data) {
        setVehicleInfo(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load vehicle info:', err);
    } finally {
      setLoadingVehicle(false);
    }
  };

  const saveExpenseChanges = async () => {
    if (!selectedExpense) return;

    try {
      // Prepare the data with proper validation - only include fields that have values
      const updateData: any = {
        merchant: editFormData.merchant,
        amountFinal: editFormData.amountFinal,
        currency: editFormData.currency,
        type: editFormData.type,
        date: editFormData.date
      };

      // Only include category if it has a valid enum value
      if (editFormData.category && ['TOLL', 'PARKING', 'REPAIR', 'OTHER'].includes(editFormData.category)) {
        updateData.category = editFormData.category;
      }

      // Only include notes if it has a value
      if (editFormData.notes && editFormData.notes.trim()) {
        updateData.notes = editFormData.notes.trim();
      }

      // Only include kilometers if it has a value
      if (editFormData.kilometers && editFormData.kilometers > 0) {
        updateData.kilometers = editFormData.kilometers;
      }

      console.log('Updating expense with data:', updateData);

      const response = await expensesApi.updateExpense(selectedExpense._id, updateData);

      if (response.success) {
        // Refresh expenses list
        await loadExpenses();
        // Exit edit mode and close modal
        setIsEditMode(false);
        setShowExpenseModal(false);
        setSelectedExpense(null);
      } else {
        console.error('Update failed:', response);
        alert(response.message || 'Failed to update expense');
      }
    } catch (err: any) {
      console.error('Update error:', err);
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert(err.message || 'Failed to update expense');
      }
    }
  };

  const loadDrivers = async (searchQuery = '') => {
    setLoadingDrivers(true);
    try {
      console.log('Loading drivers with search:', searchQuery);
      
      // Get users (API already filters to DRIVER role for Admin users)
      const response = await usersApi.getUsers({ search: searchQuery });
      console.log('Raw API response:', response);
      
      // Extract users from nested response structure
      let allUsers = [];
      if (response?.success && response?.data?.data && Array.isArray(response.data.data)) {
        allUsers = response.data.data;
      }
      
      console.log('Drivers found:', allUsers.length);
      console.log('Sample driver:', allUsers[0]);
      
      // Filter by search query if provided (additional client-side filtering)
      let filteredDrivers = allUsers;
      if (searchQuery) {
        filteredDrivers = allUsers.filter((user: any) => {
          const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesSearch;
        });
      }
      
      console.log('Drivers after filtering:', filteredDrivers.length);
      console.log('Driver examples:', filteredDrivers.slice(0, 2));
      
      setDrivers(filteredDrivers);
      
    } catch (err: any) {
      console.error('Failed to load drivers:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      setDrivers([]);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleDriverSelection = async (driverId: string) => {
    const driver = drivers.find(d => d._id === driverId);
    setSelectedDriver(driver || null);
    setAddFormData({...addFormData, driverId});

    // Load driver's vehicle if assigned
    if (driver?.assignedVehicleId) {
      // Check if assignedVehicleId is already populated (object) or just an ID (string)
      if (typeof driver.assignedVehicleId === 'object' && driver.assignedVehicleId !== null) {
        // Vehicle data is already populated
        const vehicleData = driver.assignedVehicleId as any;
        console.log('Vehicle data from populated field:', vehicleData);
        setSelectedDriverVehicle(vehicleData);
        // Set current odometer as default kilometers if available
        if (vehicleData.currentOdometer !== undefined && vehicleData.currentOdometer !== null) {
          setAddFormData(prev => ({
            ...prev,
            kilometers: vehicleData.currentOdometer
          }));
        }
      } else {
        // assignedVehicleId is just an ID string, fetch the vehicle data
        try {
          const vehicleId = typeof driver.assignedVehicleId === 'string' 
            ? driver.assignedVehicleId 
            : (driver.assignedVehicleId as any)._id;
          
          const response = await vehiclesApi.getVehicle(vehicleId);
          if (response.success && response.data) {
            console.log('Vehicle data from API:', response.data);
            setSelectedDriverVehicle(response.data);
            // Set current odometer as default kilometers
            if (response.data.currentOdometer !== undefined && response.data.currentOdometer !== null) {
              setAddFormData(prev => ({
                ...prev,
                kilometers: response.data.currentOdometer
              }));
            }
          }
        } catch (err: any) {
          console.error('Failed to load driver vehicle:', err);
          setSelectedDriverVehicle(null);
        }
      }
    } else {
      setSelectedDriverVehicle(null);
    }
  };

  const createExpense = async () => {
    try {
      let receiptUrl = '';
      
      // Upload receipt if provided
      if (addFormData.receiptFile) {
        const uploadResponse = await expensesApi.uploadReceipt(addFormData.receiptFile);
        if (uploadResponse.success && uploadResponse.data) {
          receiptUrl = uploadResponse.data.receiptUrl;
        }
      }

      const expenseData = {
        driverId: addFormData.driverId,
        merchant: addFormData.merchant,
        amountFinal: addFormData.amountFinal,
        currency: addFormData.currency,
        type: addFormData.type,
        receiptUrl: receiptUrl,
        date: addFormData.date
      };

      // Only include optional fields if they have values
      if (addFormData.category && ['TOLL', 'PARKING', 'REPAIR', 'OTHER'].includes(addFormData.category)) {
        (expenseData as any).category = addFormData.category;
      }
      
      if (addFormData.notes && addFormData.notes.trim()) {
        (expenseData as any).notes = addFormData.notes.trim();
      }
      
      if (addFormData.kilometers && addFormData.kilometers > 0) {
        (expenseData as any).kilometers = addFormData.kilometers;
      }

      const response = await expensesApi.createExpense(expenseData);

      if (response.success) {
        // Refresh expenses list
        await loadExpenses();
        // Close modal and reset form
        setShowAddExpenseModal(false);
        resetAddForm();
      } else {
        alert(response.message || 'Failed to create expense');
      }
    } catch (err: any) {
      console.error('Create expense error:', err);
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert(err.message || 'Failed to create expense');
      }
    }
  };

  const resetAddForm = () => {
    setAddFormData({
      driverId: '',
      merchant: '',
      amountFinal: 0,
      currency: 'EUR',
      type: 'MISC',
      category: '',
      notes: '',
      kilometers: 0,
      date: new Date().toISOString().split('T')[0],
      receiptFile: null,
      receiptUrl: ''
    });
    setSelectedDriver(null);
    setSelectedDriverVehicle(null);
    setDriverSearchQuery('');
    setOcrResult(null);
    setOcrProcessing(false);
  };

  const handleReceiptUpload = async (file: File) => {
    if (!file) return;
    
    setOcrProcessing(true);
    setOcrResult(null);
    
    try {
      console.log('Starting OCR processing for file:', file.name);
      
      // Upload and process with OCR
      const response = await expensesApi.uploadReceipt(file);
      console.log('OCR Response:', response);
      
      if (response.success && response.data) {
        const { receiptUrl, ocrResult } = response.data;
        
        setOcrResult(ocrResult);
        setAddFormData(prev => ({
          ...prev,
          receiptFile: file,
          receiptUrl: receiptUrl,
          // Pre-fill form fields from OCR results
          merchant: ocrResult.merchant || prev.merchant,
          amountFinal: ocrResult.amount || prev.amountFinal,
          currency: ocrResult.currency || prev.currency,
          date: ocrResult.date || prev.date
        }));
        
        console.log('OCR data extracted and form pre-filled');
      } else {
        console.warn('OCR processing failed:', response.message);
        setAddFormData(prev => ({ ...prev, receiptFile: file }));
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      setAddFormData(prev => ({ ...prev, receiptFile: file }));
    } finally {
      setOcrProcessing(false);
    }
  };

  const handleExportExpenses = async () => {
    setExportingData(true);
    try {
      // Build filter parameters from current state
      const exportFilters: any = {};
      
      if (searchQuery.trim()) {
        exportFilters.search = searchQuery.trim();
      }
      
      if (dateFromFilter) {
        exportFilters.dateFrom = dateFromFilter;
      }
      
      if (dateToFilter) {
        exportFilters.dateTo = dateToFilter;
      }
      
      if (typeFilter) {
        exportFilters.type = typeFilter;
      }

      console.log('Exporting expenses with filters:', exportFilters);
      
      const response = await expensesApi.exportExpenses(exportFilters);
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      let filename = `expenses_export_${dateStr}`;
      
      if (dateFromFilter && dateToFilter) {
        filename += `_${dateFromFilter}_to_${dateToFilter}`;
      } else if (dateFromFilter) {
        filename += `_from_${dateFromFilter}`;
      } else if (dateToFilter) {
        filename += `_until_${dateToFilter}`;
      }
      
      if (typeFilter) {
        filename += `_${typeFilter.toLowerCase()}`;
      }
      
      filename += '.csv';
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Export completed successfully');
    } catch (err: any) {
      console.error('Export failed:', err);
      if (err.response?.data?.message) {
        alert(`Export failed: ${err.response.data.message}`);
      } else {
        alert(err.message || 'Failed to export expenses');
      }
    } finally {
      setExportingData(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div>
              <div className="h-9 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-5 w-72 bg-gray-200 rounded" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-gray-200 rounded" />
              <div className="h-10 w-32 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <CardSkeleton key={i} />
            ))}
          </div>

          {/* Filters Bar Skeleton */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] h-10 bg-gray-200 rounded" />
                <div className="w-32 h-10 bg-gray-200 rounded" />
                <div className="w-32 h-10 bg-gray-200 rounded" />
                <div className="w-32 h-10 bg-gray-200 rounded" />
                <div className="w-32 h-10 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>

          {/* Table Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="h-6 w-40 bg-gray-200 rounded" />
                <div className="h-5 w-48 bg-gray-200 rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <TableSkeleton rows={10} />
            </CardContent>
          </Card>
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
              <h3 className="text-sm font-medium text-red-800">Error Loading Expenses</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FUEL':
        return 'bg-blue-100 text-blue-800';
      case 'MISC':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (type: string, category?: string) => {
    if (type === 'FUEL') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + (expense.amountFinal || 0), 0);
  const fuelExpenses = filteredExpenses.filter(e => e.type === 'FUEL');
  const miscExpenses = filteredExpenses.filter(e => e.type === 'MISC');

  // Pagination calculations
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of expenses list
    document.getElementById('expenses-list')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
            <p className="text-gray-600 mt-2">Track and manage all fleet expenses</p>
          </div>
          <div className="flex space-x-3">
            {/* HIDDEN: Export functionality - Re-enable when backend ready */}
            {/* <Button
              variant="outline"
              onClick={handleExportExpenses}
              disabled={exportingData || filteredExpenses.length === 0}
            >
              {exportingData ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 712-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export ({filteredExpenses.length})
                </>
              )}
            </Button> */}
            <Button 
              onClick={() => {
                setShowAddExpenseModal(true);
                loadDrivers('');
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Expense
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Search Expenses</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by merchant, driver, type, or category..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Date Filters - Now in same row */}
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex flex-col min-w-[140px]">
                  <label className="text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    className="px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                  />
                </div>
                <div className="flex flex-col min-w-[140px]">
                  <label className="text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input
                    type="date"
                    className="px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                  />
                </div>
                {/* Clear Filters Button */}
                {(searchQuery || dateFromFilter || dateToFilter || typeFilter) && (
                  <div className="flex">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setDateFromFilter('');
                        setDateToFilter('');
                        setTypeFilter('');
                      }}
                      className="h-12 px-4"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredExpenses.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
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
                  <p className="text-sm font-medium text-gray-600">Fuel Expenses</p>
                  <p className="text-2xl font-bold text-blue-600">{fuelExpenses.length}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(fuelExpenses.reduce((sum, e) => sum + (e.amountFinal || 0), 0))}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Misc Expenses</p>
                  <p className="text-2xl font-bold text-green-600">{miscExpenses.length}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(miscExpenses.reduce((sum, e) => sum + (e.amountFinal || 0), 0))}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Expenses List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <span>All Expenses</span>
                {filteredExpenses.length > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({startIndex + 1}-{Math.min(endIndex, filteredExpenses.length)} of {filteredExpenses.length})
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {/* Items per page selector */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Show:</label>
                  <select 
                    value={itemsPerPage} 
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-200 rounded text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  {/* Filter Dropdown */}
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setShowFilterDropdown(!showFilterDropdown);
                        setShowSortDropdown(false);
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      Filter
                      {typeFilter && <span className="ml-1 w-2 h-2 bg-primary-500 rounded-full"></span>}
                    </Button>
                    
                    {showFilterDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="p-3 space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expense Type</label>
                            <select 
                              value={typeFilter} 
                              onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setShowFilterDropdown(false);
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                              <option value="">All Types</option>
                              <option value="FUEL">Fuel</option>
                              <option value="MISC">Miscellaneous</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setShowSortDropdown(!showSortDropdown);
                        setShowFilterDropdown(false);
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                      Sort
                      {(sortBy !== 'date' || sortOrder !== 'desc') && (
                        <span className="ml-1 text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded">
                          {sortBy} {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </Button>
                    
                    {showSortDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="p-3 space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                            <select 
                              value={sortBy} 
                              onChange={(e) => {
                                setSortBy(e.target.value as 'date' | 'amount' | 'merchant' | 'driver');
                                //setShowSortDropdown(false);
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                              <option value="date">Date</option>
                              <option value="amount">Amount</option>
                              <option value="merchant">Merchant</option>
                              <option value="driver">Driver</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                            <select 
                              value={sortOrder} 
                              onChange={(e) => {
                                setSortOrder(e.target.value as 'asc' | 'desc');
                                //setShowSortDropdown(false);
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                              <option value="desc">Descending</option>
                              <option value="asc">Ascending</option>
                            </select>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => setShowSortDropdown(false)}
                            >
                              Apply Sort
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredExpenses.length > 0 ? (
              <>
                <div className="space-y-4">
                  {paginatedExpenses.map((expense) => (
                    <div key={expense._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(expense.type)}`}>
                          {getCategoryIcon(expense.type, expense.category)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{expense.merchant || 'Unknown Merchant'}</h3>
                          <p className="text-sm text-gray-500">
                            {expense.type} {expense.category ? `• ${expense.category}` : ''}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(expense.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} • Driver: {
                              typeof expense.driverId === 'object' && expense.driverId?.name
                                ? expense.driverId.name
                                : typeof expense.driverId === 'string'
                                ? `ID: ${expense.driverId.slice(-6)}`
                                : 'Unknown'
                            }
                            {expense.kilometers && ` • ${expense.kilometers} km`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(expense.amountFinal || 0)}
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            {expense.currency || 'EUR'}
                          </Badge>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedExpense(expense);
                              setIsEditMode(false);
                              setShowExpenseModal(true);
                            }}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedExpense(expense);
                              setIsEditMode(true);
                              setShowExpenseModal(true);
                            }}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredExpenses.length)} of {filteredExpenses.length} results
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Previous Button */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </Button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "primary" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <>
                            <span className="px-2 text-gray-400">...</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(totalPages)}
                              className="w-8 h-8 p-0"
                            >
                              {totalPages}
                            </Button>
                          </>
                        )}
                      </div>
                      
                      {/* Next Button */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">
                  {expenses.length === 0 ? '💳' : '🔍'}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {expenses.length === 0 ? 'No expenses found' : 'No expenses match your filters'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {expenses.length === 0 
                    ? 'Expenses will appear here once drivers start submitting them.'
                    : 'Try adjusting your search or date filters to see more results.'
                  }
                </p>
                {expenses.length === 0 ? (
                  <Button>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add First Expense
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setDateFromFilter('');
                      setDateToFilter('');
                      setTypeFilter('');
                    }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Details Modal */}
        {showExpenseModal && selectedExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isEditMode ? 'Edit Expense' : 'Expense Details'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedExpense.merchant || 'Unknown Merchant'} • {new Date(selectedExpense.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowExpenseModal(false);
                    setSelectedExpense(null);
                    setIsEditMode(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Merchant</label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editFormData.merchant}
                        onChange={(e) => setEditFormData({...editFormData, merchant: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    ) : (
                      <div className="text-gray-900 font-medium">
                        {selectedExpense.merchant || 'Unknown Merchant'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    {isEditMode ? (
                      <input
                        type="date"
                        value={editFormData.date}
                        onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    ) : (
                      <div className="text-gray-900">
                        {new Date(selectedExpense.date).toLocaleDateString('de-DE', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    {isEditMode ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editFormData.amountFinal}
                        onChange={(e) => setEditFormData({...editFormData, amountFinal: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    ) : (
                      <div className="text-gray-900 font-semibold text-lg">
                        {formatCurrency(selectedExpense.amountFinal || 0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    {isEditMode ? (
                      <select
                        value={editFormData.type}
                        onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="FUEL">FUEL</option>
                        <option value="MISC">MISC</option>
                      </select>
                    ) : (
                      <Badge className={getTypeColor(selectedExpense.type)}>
                        {selectedExpense.type}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Driver</label>
                    <div className="text-gray-900">
                      {typeof selectedExpense.driverId === 'object' && selectedExpense.driverId?.name
                        ? selectedExpense.driverId.name
                        : typeof selectedExpense.driverId === 'string'
                        ? `ID: ${selectedExpense.driverId.slice(-6)}`
                        : 'Unknown'
                      }
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    {isEditMode ? (
                      <select
                        value={editFormData.currency}
                        onChange={(e) => setEditFormData({...editFormData, currency: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                      </select>
                    ) : (
                      <div className="text-gray-900">
                        {selectedExpense.currency || 'EUR'}
                      </div>
                    )}
                  </div>
                  
                  {/* Vehicle Information */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
                    {loadingVehicle ? (
                      <div className="flex items-center">
                        <Spinner size="sm" />
                        <span className="ml-2 text-gray-500">Loading vehicle info...</span>
                      </div>
                    ) : vehicleInfo ? (
                      <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-900 font-medium">
                            {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vehicleInfo.licensePlate} • {vehicleInfo.type}
                            {vehicleInfo.color && ` • ${vehicleInfo.color}`}
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {vehicleInfo.status}
                        </Badge>
                      </div>
                    ) : (selectedExpense.vehicleId && selectedExpense.vehicleId !== null) ? (
                      <div className="text-gray-500">Vehicle information not found</div>
                    ) : (
                      <div className="text-gray-500">No vehicle assigned</div>
                    )}
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    {isEditMode ? (
                      <select
                        value={editFormData.category}
                        onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select category (optional)</option>
                        <option value="TOLL">Toll</option>
                        <option value="PARKING">Parking</option>
                        <option value="REPAIR">Repair</option>
                        <option value="OTHER">Other</option>
                      </select>
                    ) : selectedExpense.category ? (
                      <div className="text-gray-900">{selectedExpense.category}</div>
                    ) : (
                      <div className="text-gray-500">No category set</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kilometers</label>
                    {isEditMode ? (
                      <input
                        type="number"
                        step="1"
                        value={editFormData.kilometers}
                        onChange={(e) => setEditFormData({...editFormData, kilometers: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter kilometers (optional)"
                      />
                    ) : selectedExpense.kilometers ? (
                      <div className="text-gray-900">{selectedExpense.kilometers} km</div>
                    ) : (
                      <div className="text-gray-500">No kilometers recorded</div>
                    )}
                  </div>

                  {(isEditMode || selectedExpense.notes) && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      {isEditMode ? (
                        <textarea
                          value={editFormData.notes}
                          onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Enter additional notes (optional)"
                        />
                      ) : selectedExpense.notes ? (
                        <div className="text-gray-900">{selectedExpense.notes}</div>
                      ) : (
                        <div className="text-gray-500">No notes</div>
                      )}
                    </div>
                  )}
                </div>

                {/* OCR Details */}
                {((selectedExpense as any).amountOcr || (selectedExpense as any).confidence) && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">OCR Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {(selectedExpense as any).amountOcr && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">OCR Amount</label>
                          <div className="text-gray-600">{formatCurrency((selectedExpense as any).amountOcr)}</div>
                        </div>
                      )}
                      {(selectedExpense as any).confidence && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">OCR Confidence</label>
                          <div className="text-gray-600">{Math.round((selectedExpense as any).confidence * 100)}%</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Receipt Image Section */}
                {selectedExpense.receiptUrl && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Receipt Image</h3>
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer group"
                         onClick={() => setShowFullSizeImage(true)}>
                      <img 
                        src={selectedExpense.receiptUrl} 
                        alt="Receipt" 
                        className="w-full h-64 object-contain bg-white transition-transform group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden flex items-center justify-center bg-gray-100 text-gray-500">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p>Receipt image unavailable</p>
                        </div>
                      </div>
                      {/* Overlay hint */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-2 shadow-lg">
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">Click to view full size</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Timestamps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                      <div className="text-gray-600">
                        {new Date(selectedExpense.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                      <div className="text-gray-600">
                        {new Date(selectedExpense.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowExpenseModal(false);
                    setSelectedExpense(null);
                    setIsEditMode(false);
                  }}
                >
                  Close
                </Button>
                {isEditMode && (
                  <Button onClick={saveExpenseChanges}>
                    Save Changes
                  </Button>
                )}
                {!isEditMode && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditMode(true)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Expense
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Full Size Image Modal */}
        {showFullSizeImage && selectedExpense?.receiptUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
               onClick={() => setShowFullSizeImage(false)}>
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setShowFullSizeImage(false)}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img 
                src={selectedExpense.receiptUrl} 
                alt="Receipt - Full Size" 
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        {/* Add Expense Modal */}
        {showAddExpenseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Add New Expense</h2>
                  <p className="text-sm text-gray-500 mt-1">Create an expense for a driver</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddExpenseModal(false);
                    resetAddForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Driver Selection - Always First */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Driver <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Search Input */}
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Search drivers by name or email..."
                      value={driverSearchQuery}
                      onChange={(e) => {
                        setDriverSearchQuery(e.target.value);
                        loadDrivers(e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {loadingDrivers ? (
                    <div className="flex items-center py-2">
                      <Spinner size="sm" />
                      <span className="ml-2 text-gray-500">Loading drivers...</span>
                    </div>
                  ) : (
                    <>
                      <select
                        value={addFormData.driverId}
                        onChange={(e) => handleDriverSelection(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      >
                        <option value="">Choose a driver...</option>
                        {drivers.map((driver) => (
                          <option key={driver._id} value={driver._id}>
                            {driver.name} ({driver.email})
                          </option>
                        ))}
                      </select>
                      {drivers.length === 0 && !loadingDrivers && (
                        <p className="text-sm text-red-500 mt-1">
                          {driverSearchQuery 
                            ? `No drivers found matching "${driverSearchQuery}"`
                            : "No drivers found. Please check if drivers exist in the system."
                          }
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Found {drivers.length} driver{drivers.length !== 1 ? 's' : ''}
                        {driverSearchQuery && ` matching "${driverSearchQuery}"`}
                      </p>
                    </>
                  )}
                </div>

                {/* Driver & Vehicle Info */}
                {selectedDriver && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Driver & Vehicle Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Driver</label>
                        <div className="text-gray-900">{selectedDriver.name}</div>
                        <div className="text-sm text-gray-500">{selectedDriver.email}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Assigned Vehicle</label>
                        {selectedDriverVehicle ? (
                          <div>
                            <div className="text-gray-900 font-medium">
                              {selectedDriverVehicle.year} {selectedDriverVehicle.make} {selectedDriverVehicle.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              {selectedDriverVehicle.licensePlate} • Current KM: {selectedDriverVehicle.currentOdometer !== undefined && selectedDriverVehicle.currentOdometer !== null ? `${selectedDriverVehicle.currentOdometer.toLocaleString()} km` : 'N/A'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500">No vehicle assigned</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Expense Form - Only show after driver is selected */}
                {selectedDriver && (
                  <>
                    {/* Receipt Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Receipt Image (Optional)
                        {ocrProcessing && (
                          <span className="ml-2 text-blue-600 text-sm">
                            🔄 Processing with OCR...
                          </span>
                        )}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            await handleReceiptUpload(file);
                          }
                        }}
                        disabled={ocrProcessing}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500">
                          Upload a receipt image for automatic OCR processing
                        </p>
                        {ocrResult && (
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                            ✓ OCR processed (confidence: {Math.round(ocrResult.confidence * 100)}%)
                          </span>
                        )}
                      </div>
                      {ocrResult && ocrResult.confidence < 0.5 && (
                        <p className="text-sm text-amber-600 mt-1">
                          ⚠️ Low confidence OCR results - please verify the extracted data
                        </p>
                      )}
                    </div>

                    {/* Basic Expense Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Merchant <span className="text-red-500">*</span>
                          {ocrResult && ocrResult.merchant && (
                            <span className="ml-2 text-xs text-blue-600">✨ OCR</span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={addFormData.merchant}
                          onChange={(e) => setAddFormData({...addFormData, merchant: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            ocrResult && ocrResult.merchant ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date <span className="text-red-500">*</span>
                          {ocrResult && ocrResult.date && (
                            <span className="ml-2 text-xs text-blue-600">✨ OCR</span>
                          )}
                        </label>
                        <input
                          type="date"
                          value={addFormData.date}
                          onChange={(e) => setAddFormData({...addFormData, date: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            ocrResult && ocrResult.date ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount <span className="text-red-500">*</span>
                          {ocrResult && ocrResult.amount && (
                            <span className="ml-2 text-xs text-blue-600">✨ OCR</span>
                          )}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={addFormData.amountFinal}
                          onChange={(e) => setAddFormData({...addFormData, amountFinal: parseFloat(e.target.value) || 0})}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            ocrResult && ocrResult.amount ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                          {ocrResult && ocrResult.currency && (
                            <span className="ml-2 text-xs text-blue-600">✨ OCR</span>
                          )}
                        </label>
                        <select
                          value={addFormData.currency}
                          onChange={(e) => setAddFormData({...addFormData, currency: e.target.value})}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            ocrResult && ocrResult.currency ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          <option value="EUR">EUR</option>
                          <option value="USD">USD</option>
                          <option value="GBP">GBP</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select
                          value={addFormData.type}
                          onChange={(e) => setAddFormData({...addFormData, type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="FUEL">FUEL</option>
                          <option value="MISC">MISC</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={addFormData.category}
                          onChange={(e) => setAddFormData({...addFormData, category: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Select category (optional)</option>
                          <option value="TOLL">Toll</option>
                          <option value="PARKING">Parking</option>
                          <option value="REPAIR">Repair</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kilometers</label>
                        <input
                          type="number"
                          step="1"
                          value={addFormData.kilometers}
                          onChange={(e) => setAddFormData({...addFormData, kilometers: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder={selectedDriverVehicle?.currentOdometer ? `Current: ${selectedDriverVehicle.currentOdometer.toLocaleString()} km` : 'Enter kilometers'}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <textarea
                          value={addFormData.notes}
                          onChange={(e) => setAddFormData({...addFormData, notes: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Additional notes (optional)"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddExpenseModal(false);
                    resetAddForm();
                  }}
                >
                  Cancel
                </Button>
                {selectedDriver && (
                  <Button 
                    onClick={createExpense}
                    disabled={!addFormData.driverId || !addFormData.merchant || !addFormData.amountFinal}
                  >
                    Create Expense
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
  );
}