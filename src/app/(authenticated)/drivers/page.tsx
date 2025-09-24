'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { usersApi, vehiclesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { TableSkeleton, CardSkeleton } from '@/components/ui/skeleton';
import type { User, Vehicle, UserStatus } from "../../../types"

// Extend User type to handle populated vehicle data
interface UserWithVehicle extends Omit<User, 'assignedVehicleId'> {
  assignedVehicleId?: string | Vehicle;
}

export default function DriversPage() {
  const { t } = useTranslation('users');
  const router = useRouter();
  const [drivers, setDrivers] = useState<UserWithVehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [pageSize] = useState(10); // Items per page
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState(''); // 'assigned' or 'unassigned'
  const [searchQuery, setSearchQuery] = useState(''); // The actual search query sent to API
  const [searchInput, setSearchInput] = useState(''); // The input field value
  
  // Sorting
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<UserWithVehicle | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    assignedVehicleId: ''
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    status: '',
    assignedVehicleId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<UserWithVehicle | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Ref to maintain search input focus
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDrivers();
    loadVehicles();
  }, []);

  // Debounce search input (wait 300ms after user stops typing)  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmedInput = searchInput.trim();
      const trimmedQuery = searchQuery.trim();
      
      if (trimmedInput !== trimmedQuery) {
        setSearchQuery(trimmedInput);
        if (trimmedInput !== '' || trimmedQuery !== '') {
          // Only reset page if we're actually changing the search
          setCurrentPage(1);
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Reload drivers when pagination, filters, or sorting changes
  useEffect(() => {
    if (!loading) { // Skip initial load
      // Determine if this is a search operation (avoid treating empty search as search operation)
      const isSearchOperation = searchQuery.trim() !== '';
      loadDrivers(isSearchOperation);
    }
  }, [currentPage, statusFilter, vehicleFilter, searchQuery, sortBy, sortOrder]);

  const loadDrivers = async (isSearching = false) => {
    try {
      // For the very first load, use main loading
      if (drivers.length === 0 && !isSearching) {
        setLoading(true);
      } else if (isSearching) {
        // For search operations, use search loading
        setSearchLoading(true);
      }
      // For other operations (pagination, filters), don't show loading at all

      const params: any = {
        role: 'DRIVER',
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortOrder
      };

      // Add filters if they exist
      if (statusFilter) params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      
      const response = await usersApi.getUsers(params);
      if (response.success && response.data) {
        // API returns paginated response: { data: User[], pagination: {...} }
        const driversData = response.data.data || [];
        const pagination = response.data.pagination;
        
        setDrivers(driversData);
        setTotalPages(pagination?.pages || 1);
        setTotalDrivers(pagination?.total || 0);
        setError('');
      } else {
        setError(response.message || 'Failed to load drivers');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load drivers');
    } finally {
      // Only set main loading to false if it was true
      if (drivers.length === 0) {
        setLoading(false);
      }
      setSearchLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const response = await vehiclesApi.getVehicles();
      if (response.success && response.data) {
        setVehicles(response.data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load vehicles:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const driverData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'DRIVER' as const,
        assignedVehicleId: formData.assignedVehicleId || undefined
      };

      const response = await usersApi.createUser(driverData);
      if (response.success) {
        // Add the new driver to the list
        setDrivers(prev => [response.data, ...prev]);
        
        // Reset form and close modal
        setFormData({ name: '', email: '', password: '', assignedVehicleId: '' });
        setShowAddModal(false);
        setError('');
      } else {
        setError(response.message || 'Failed to create driver');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create driver');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDriver = (driver: UserWithVehicle) => {
    setSelectedDriver(driver);
    const vehicleId = typeof driver.assignedVehicleId === 'object' 
      ? (driver.assignedVehicleId as Vehicle)._id 
      : driver.assignedVehicleId;
    setEditFormData({
      name: driver.name,
      email: driver.email,
      status: driver.status,
      assignedVehicleId: vehicleId || ''
    });
    setShowEditModal(true);
    setError('');
  };

  const handleViewDetails = (driver: UserWithVehicle) => {
    router.push(`/drivers/${driver._id}`);
  };

  const handleUpdateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;
    
    setSubmitting(true);

    try {
      const updateData = {
        name: editFormData.name,
        email: editFormData.email,
        status: editFormData.status,
        assignedVehicleId: editFormData.assignedVehicleId || undefined
      };

      const response = await usersApi.updateUser(selectedDriver._id, updateData);
      
      if (response.success) {
        // Update the driver in the list
        setDrivers(prev => prev.map(driver =>
          driver._id === selectedDriver._id
            ? { ...driver, ...updateData, status: updateData.status as UserStatus }
            : driver
        ));
        
        // Close modal and reset
        setShowEditModal(false);
        setSelectedDriver(null);
        setError('');
      } else {
        setError(response.message || 'Failed to update driver');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update driver');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper functions for filtering and search
  const handleSearchInputChange = (query: string) => {
    setSearchInput(query); // Update input immediately for UI responsiveness
  };

  const handleSearchClear = () => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleFilterChange = (type: string, value: string) => {
    if (type === 'status') setStatusFilter(value);
    if (type === 'vehicle') setVehicleFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort order if clicking same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Apply client-side vehicle filter (since API might not support this)
  const filteredDrivers = vehicleFilter 
    ? drivers.filter(driver => {
        const hasVehicle = !!driver.assignedVehicleId;
        if (vehicleFilter === 'assigned') return hasVehicle;
        if (vehicleFilter === 'unassigned') return !hasVehicle;
        return true;
      })
    : drivers;

  const handleDeleteDriver = (driver: UserWithVehicle) => {
    setDriverToDelete(driver);
    setShowDeleteModal(true);
    setError('');
  };

  const confirmDeleteDriver = async () => {
    if (!driverToDelete) return;

    setDeleting(true);
    try {
      const response = await usersApi.deleteUser(driverToDelete._id);
      
      if (response.success) {
        // Update the driver status to INACTIVE in the local state
        setDrivers(prev => prev.map(driver =>
          driver._id === driverToDelete._id
            ? { ...driver, status: 'INACTIVE' as UserStatus }
            : driver
        ));
        
        // Close modal and reset
        setShowDeleteModal(false);
        setDriverToDelete(null);
        setError('');
      } else {
        setError(response.message || 'Failed to delete driver');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete driver');
    } finally {
      setDeleting(false);
    }
  };

  // Show skeleton while loading
  if (loading && drivers.length === 0) {
    return (
      <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div>
              <div className="h-9 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-5 w-64 bg-gray-200 rounded" />
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <CardSkeleton key={i} />
            ))}
          </div>

          {/* Search and Filters Skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 h-10 bg-gray-200 rounded" />
                <div className="w-full lg:w-48 h-10 bg-gray-200 rounded" />
                <div className="w-full lg:w-48 h-10 bg-gray-200 rounded" />
                <div className="w-full lg:w-48 h-10 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>

          {/* Table Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent>
              <TableSkeleton rows={5} />
            </CardContent>
          </Card>
        </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading Drivers</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  const getAssignedVehicle = (driver: UserWithVehicle): Vehicle | undefined => {
    // Check if assignedVehicleId is already populated
    if (driver.assignedVehicleId && typeof driver.assignedVehicleId === 'object') {
      return driver.assignedVehicleId as Vehicle;
    }
    
    // Otherwise try to find by ID
    if (driver.assignedVehicleId && typeof driver.assignedVehicleId === 'string') {
      const vehicleById = vehicles.find(vehicle => vehicle._id === driver.assignedVehicleId);
      if (vehicleById) return vehicleById;
    }
    
    // Fallback: find by vehicle's assignedDriverId
    return vehicles.find(vehicle => vehicle.assignedDriverId === driver._id);
  };

  const getAvailableVehicles = (excludeDriverId?: string): Vehicle[] => {
    return vehicles.filter(vehicle => {
      // Only show ACTIVE vehicles (regardless of assignment status)
      return vehicle.status === 'ACTIVE';
    });
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('driversTitle')}</h1>
            <p className="text-gray-600 mt-2">{t('driversSubtitle')}</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('addDriver')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('stats.totalDrivers', 'Total Drivers')}</p>
                  <p className="text-2xl font-bold text-gray-900">{totalDrivers}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('stats.activeDrivers', 'Active Drivers')}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {drivers.filter(d => d.status === 'ACTIVE').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('stats.inactiveDrivers', 'Inactive Drivers')}</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {drivers.filter(d => d.status !== 'ACTIVE').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">With Vehicles</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {drivers.filter(d => !!d.assignedVehicleId).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {drivers.length - drivers.filter(d => !!d.assignedVehicleId).length} unassigned
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8m-4 4v-8M9 5l3-3 3 3m-6 10l3 3 3-3" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  {searchLoading ? (
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search drivers by name or email..."
                    value={searchInput}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchInput && (
                    <button
                      onClick={handleSearchClear}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div className="w-full lg:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>

              {/* Vehicle Assignment Filter */}
              <div className="w-full lg:w-48">
                <select
                  value={vehicleFilter}
                  onChange={(e) => handleFilterChange('vehicle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('filters.allDrivers', 'All Drivers')}</option>
                  <option value="assigned">{t('filters.withVehicle', 'With Vehicle')}</option>
                  <option value="unassigned">{t('filters.withoutVehicle', 'Without Vehicle')}</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="w-full lg:w-48">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order as 'asc' | 'desc');
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="email-asc">Email (A-Z)</option>
                  <option value="email-desc">Email (Z-A)</option>
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="lastActive-desc">Recently Active</option>
                  <option value="lastActive-asc">Least Active</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || statusFilter || vehicleFilter) && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                    Search: "{searchQuery}"
                    <button onClick={handleSearchClear} className="ml-1 text-blue-600 hover:text-blue-800">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {statusFilter && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                    Status: {statusFilter}
                    <button onClick={() => handleFilterChange('status', '')} className="ml-1 text-green-600 hover:text-green-800">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {vehicleFilter && (
                  <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md">
                    Vehicle: {vehicleFilter === 'assigned' ? 'With Vehicle' : 'Without Vehicle'}
                    <button onClick={() => handleFilterChange('vehicle', '')} className="ml-1 text-purple-600 hover:text-purple-800">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchInput('');
                    setSearchQuery('');
                    setStatusFilter('');
                    setVehicleFilter('');
                    setCurrentPage(1);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Drivers List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{t('table.allDrivers', 'All Drivers')}</CardTitle>
              <div className="text-sm text-gray-600">
                {t('table.showingDrivers', 'Showing {{start}}-{{end}} of {{total}} drivers', {
                  start: ((currentPage - 1) * pageSize) + 1,
                  end: Math.min(currentPage * pageSize, totalDrivers),
                  total: totalDrivers
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredDrivers.length > 0 ? (
              <>
                <div className="space-y-4">
                  {filteredDrivers.map((driver) => (
                  <div key={driver._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-semibold text-lg">
                          {driver.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                        <p className="text-sm text-gray-500">{driver.email}</p>
                        {(() => {
                          const assignedVehicle = getAssignedVehicle(driver);
                          return assignedVehicle ? (
                            <p className="text-xs text-blue-600 mt-1">
                              🚗 {assignedVehicle.make} {assignedVehicle.model} ({assignedVehicle.licensePlate})
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 mt-1">No vehicle assigned</p>
                          );
                        })()}
                        <p className="text-xs text-gray-400 mt-1">
                          Last active: {driver.lastActive ? new Date(driver.lastActive).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Never'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge variant={getStatusColor(driver.status)}>
                        {driver.status}
                      </Badge>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditDriver(driver)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(driver)}
                        >
                          View Details
                        </Button>
                        {driver.status !== 'INACTIVE' && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteDriver(driver)}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = index + 1;
                          } else if (currentPage <= 3) {
                            pageNum = index + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + index;
                          } else {
                            pageNum = currentPage - 2 + index;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 text-sm rounded-md ${
                                pageNum === currentPage
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🚗</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No drivers found</h3>
                <p className="text-gray-500 mb-6">Get started by adding your first driver to the system.</p>
                <Button onClick={() => setShowAddModal(true)}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add First Driver
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Driver Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Driver</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter driver's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter driver's email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter driver's password"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Vehicle (Optional)
                  </label>
                  <select
                    value={formData.assignedVehicleId}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedVehicleId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">No vehicle assigned</option>
                    {getAvailableVehicles().map((vehicle) => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.make} {vehicle.model} ({vehicle.licensePlate}) - {vehicle.year}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    All active vehicles are shown (including already assigned ones)
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    disabled={submitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Creating...' : 'Create Driver'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Driver Modal */}
        {showEditModal && selectedDriver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Driver</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedDriver(null);
                    setError('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateDriver} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter driver's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter driver's email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    required
                    value={editFormData.status}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Vehicle (Optional)
                  </label>
                  <select
                    value={editFormData.assignedVehicleId}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, assignedVehicleId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">No vehicle assigned</option>
                    {getAvailableVehicles(selectedDriver?._id).map((vehicle) => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.make} {vehicle.model} ({vehicle.licensePlate}) - {vehicle.year}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    All active vehicles are shown (including already assigned ones)
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedDriver(null);
                      setError('');
                    }}
                    disabled={submitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Updating...' : 'Update Driver'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && driverToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Driver</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete <strong>{driverToDelete.name}</strong>? 
                  This will deactivate their account and they will no longer be able to access the system.
                </p>
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-amber-800 font-medium">Note:</p>
                      <p className="text-sm text-amber-700">
                        This will set the driver's status to INACTIVE. Their data will be preserved for reporting purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDriverToDelete(null);
                    setError('');
                  }}
                  disabled={deleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={confirmDeleteDriver}
                  disabled={deleting}
                  className="flex-1"
                >
                  {deleting ? (
                    <>
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete Driver'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}