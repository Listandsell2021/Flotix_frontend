'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { api, usersApi, authApi } from '@/lib/api';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Toast from '@/components/ui/Toast';

interface Company {
  _id: string;
  name: string;
  plan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  driverLimit: number;
  currentDriverCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function CompaniesPage() {
  const { t } = useTranslation('common');
  const { startImpersonation } = useImpersonation();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [impersonatingCompanyId, setImpersonatingCompanyId] = useState<string | null>(null);

  // Filter and Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'driverLimit'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    driverLimit: 50,
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    plan: 'PROFESSIONAL' as 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
    driverLimit: 50,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  // Apply filters, search, and sorting whenever they change
  useEffect(() => {
    let result = [...companies];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(company =>
        company.name.toLowerCase().includes(query) ||
        company._id.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(company => company.status === statusFilter);
    }

    // Plan filter
    if (planFilter !== 'ALL') {
      result = result.filter(company => company.plan === planFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'driverLimit':
          comparison = a.driverLimit - b.driverLimit;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredCompanies(result);
  }, [companies, searchQuery, statusFilter, planFilter, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPlanFilter('ALL');
    setSortBy('name');
    setSortOrder('asc');
  };

  const activeFilterCount = [
    searchQuery,
    statusFilter !== 'ALL' ? statusFilter : null,
    planFilter !== 'ALL' ? planFilter : null,
  ].filter(Boolean).length;

  const loadCompanies = async () => {
    try {
      const response = await api.get('/companies');
      if (response.data.success && response.data.data) {
        // API returns paginated response: { data: Company[], pagination: {...} }
        setCompanies(response.data.data.data || []);
      } else {
        setToast({
          message: response.data.message || 'Failed to load companies',
          type: 'error'
        });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load companies';
      console.error('Error loading companies:', err);
      setToast({
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(''); // Clear previous errors

    try {
      // First, check if the email already exists (optional check - if it fails, we continue)
      try {
        const emailCheckResponse = await usersApi.getUsers({ limit: 1000 });

        if (emailCheckResponse.success && emailCheckResponse.data) {
          const users = Array.isArray(emailCheckResponse.data)
            ? emailCheckResponse.data
            : emailCheckResponse.data.users || [];

          const existingUser = users.find(
            (user: any) => user.email.toLowerCase() === formData.adminEmail.toLowerCase()
          );

          if (existingUser) {
            setToast({
              message: `Email "${formData.adminEmail}" is already registered. Please use a different email.`,
              type: 'error'
            });
            setSubmitting(false);
            return;
          }
        }
      } catch (checkError) {
        // If email check fails, just log and continue - backend will validate
        console.log('Email check failed, continuing with submission:', checkError);
      }

      // Use atomic endpoint to create company and admin together
      const requestData = {
        company: {
          name: formData.name,
          driverLimit: formData.driverLimit
        },
        admin: {
          name: formData.adminName,
          email: formData.adminEmail,
          password: formData.adminPassword
        }
      };

      const response = await api.post('/companies/create-with-admin', requestData);

      if (response.data.success) {
        const { company: createdCompany, admin: createdAdmin } = response.data.data;

        // Both company and admin created successfully
        setCompanies(prev => [createdCompany, ...prev]);
        setToast({
          message: `Company "${formData.name}" created successfully with admin user.`,
          type: 'success'
        });
        setError('');
      }

      // Reset form and close modal
      setFormData({
        name: '',
        driverLimit: 50,
        adminName: '',
        adminEmail: '',
        adminPassword: ''
      });
      setShowAddModal(false);

    } catch (err: any) {
      console.error('Error creating company:', err);
      console.error('Error response:', err.response);

      // Extract the actual error message
      let errorMessage = 'Failed to create company';

      // Try to get the most specific error message
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data) {
        // Sometimes the entire data object is the error message
        errorMessage = typeof err.response.data === 'string'
          ? err.response.data
          : err.message || 'Failed to create company';
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Make email-related errors more user-friendly
      const lowerMessage = errorMessage.toLowerCase();

      // Check for email-related errors
      if (lowerMessage.includes('email')) {
        if (lowerMessage.includes('exist') ||
            lowerMessage.includes('already') ||
            lowerMessage.includes('duplicate') ||
            lowerMessage.includes('unique')) {
          errorMessage = `Email "${formData.adminEmail}" is already registered. Please use a different email.`;
        }
      }

      // Check for validation errors
      if (lowerMessage === 'validation error' || lowerMessage.includes('validation')) {
        errorMessage = `Email "${formData.adminEmail}" is already registered. Please use a different email.`;
      }

      // Check for generic server errors - likely email duplicate
      if (lowerMessage.includes('internal server') || lowerMessage.includes('500')) {
        errorMessage = `Email "${formData.adminEmail}" is already registered. Please use a different email.`;
      }

      setToast({
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowViewModal(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setEditFormData({
      name: company.name,
      plan: company.plan,
      driverLimit: company.driverLimit,
      status: company.status
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    setSubmitting(true);

    try {
      const response = await api.put(`/companies/${selectedCompany._id}`, editFormData);
      if (response.data.success) {
        // Update the company in the list
        setCompanies(prev => prev.map(c =>
          c._id === selectedCompany._id ? { ...c, ...response.data.data } : c
        ));

        // Close modal and reset
        setShowEditModal(false);
        setSelectedCompany(null);
        setError('');
      } else {
        setError(response.data.message || 'Failed to update company');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginAsAdmin = async (company: Company) => {
    if (impersonatingCompanyId) return; // Prevent multiple clicks

    setImpersonatingCompanyId(company._id);

    try {
      // Get admin token for this company
      const response = await authApi.impersonateCompanyAdmin(company._id);

      // Start impersonation with the complete admin data (user + tokens)
      startImpersonation(company._id, company.name, {
        user: response.user,
        tokens: response.tokens,
      });

    } catch (err: any) {
      console.error('Impersonation error:', err);
      alert(err.message || 'Failed to login as admin. Please ensure the company has an active admin user.');
      setImpersonatingCompanyId(null);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading companies...</p>
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

  const getTranslatedStatus = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return t('status.active');
      case 'INACTIVE':
        return t('status.inactive');
      case 'SUSPENDED':
        return t('status.suspended');
      default:
        return status;
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

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'STARTER':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'PROFESSIONAL':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'ENTERPRISE':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
            <p className="text-gray-600 mt-2">Manage all companies and their subscriptions</p>
          </div>
          <div className="flex space-x-3">
            {/* HIDDEN: Export functionality - Re-enable when backend ready */}
            {/* <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </Button> */}
            <Button onClick={() => setShowAddModal(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Company
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Companies</p>
                  <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Active Companies</p>
                  <p className="text-2xl font-bold text-green-600">
                    {companies.filter(c => c.status === 'ACTIVE').length}
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
                  <p className="text-sm font-medium text-gray-600">Professional Plans</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {companies.filter(c => c.plan === 'PROFESSIONAL').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Driver Limit</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {companies.reduce((sum, c) => sum + c.driverLimit, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by company name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="ALL">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>

                  {/* Plan Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
                    <select
                      value={planFilter}
                      onChange={(e) => setPlanFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="ALL">All Plans</option>
                      <option value="STARTER">Starter</option>
                      <option value="PROFESSIONAL">Professional</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <div className="flex gap-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt' | 'driverLimit')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="name">Name</option>
                        <option value="createdAt">Date Created</option>
                        <option value="driverLimit">Driver Limit</option>
                      </select>
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                      >
                        {sortOrder === 'asc' ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Filters Display & Clear Button */}
                {activeFilterCount > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {searchQuery && (
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2">
                          Search: "{searchQuery}"
                          <button onClick={() => setSearchQuery('')} className="hover:text-primary-900">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      )}
                      {statusFilter !== 'ALL' && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2">
                          Status: {statusFilter}
                          <button onClick={() => setStatusFilter('ALL')} className="hover:text-green-900">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      )}
                      {planFilter !== 'ALL' && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2">
                          Plan: {planFilter}
                          <button onClick={() => setPlanFilter('ALL')} className="hover:text-purple-900">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredCompanies.length}</span> of <span className="font-semibold">{companies.length}</span> companies
            </div>
          </CardContent>
        </Card>

        {/* Companies List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Companies</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCompanies.length > 0 ? (
              <div className="space-y-4">
                {filteredCompanies.map((company) => (
                  <div key={company._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getPlanColor(company.plan)}`}>
                        {getPlanIcon(company.plan)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{company.name}</h3>
                        <p className="text-sm text-gray-500">
                          Driver Limit: {company.driverLimit} 
                          {company.currentDriverCount !== undefined && 
                            ` • Current: ${company.currentDriverCount}`
                          }
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {new Date(company.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge variant={getStatusColor(company.status)} className="mb-2">
                          {getTranslatedStatus(company.status)}
                        </Badge>
                        <Badge variant="default" className={`block ${getPlanColor(company.plan)}`}>
                          {company.plan}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <Link href={`/companies/${company._id}`}>
                            <Button variant="outline" size="sm" title={`View data for company ID: ${company._id}`}>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              View Data
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" onClick={() => handleViewCompany(company)}>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Quick View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditCompany(company)}>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Button>
                        </div>
                        <Button
                          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                          size="sm"
                          onClick={() => handleLoginAsAdmin(company)}
                          disabled={impersonatingCompanyId === company._id || company.status !== 'ACTIVE'}
                        >
                          {impersonatingCompanyId === company._id ? (
                            <>
                              <Spinner size="sm" className="w-4 h-4 mr-2" />
                              Logging in...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                              </svg>
                              Login as Admin
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">
                  {companies.length === 0 ? '🏢' : '🔍'}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {companies.length === 0 ? 'No companies found' : 'No matching companies'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {companies.length === 0
                    ? 'Get started by adding your first company to the system.'
                    : 'Try adjusting your filters or search query to find what you\'re looking for.'
                  }
                </p>
                {companies.length === 0 ? (
                  <Button onClick={() => setShowAddModal(true)}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add First Company
                  </Button>
                ) : (
                  <Button variant="outline" onClick={clearFilters}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Company Modal */}
        {showAddModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-16"
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Company & Admin</h3>
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
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter company name"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver Limit
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="1000"
                    value={formData.driverLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, driverLimit: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter driver limit"
                  />
                </div>

                {/* Admin User Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Company Administrator</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.adminName}
                        onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter admin full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.adminEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter admin email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Password
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.adminPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter admin password"
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            // Generate simple, easy password: Word + Number (e.g., Apple123, Blue456)
                            const words = ['Apple', 'Blue', 'Green', 'Red', 'Sun', 'Moon', 'Star', 'Cloud', 'Rain', 'Wind'];
                            const randomWord = words[Math.floor(Math.random() * words.length)];
                            const randomNum = Math.floor(100 + Math.random() * 900); // 3-digit number
                            const password = randomWord + randomNum;
                            setFormData(prev => ({ ...prev, adminPassword: password }));
                          }}
                          className="whitespace-nowrap"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Generate
                        </Button>
                      </div>
                    </div>
                  </div>
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
                    {submitting ? 'Creating...' : 'Create Company & Admin'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Company Modal */}
        {showViewModal && selectedCompany && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-16"
            onClick={() => setShowViewModal(false)}
          >
            <div
              className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Company Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <p className="text-gray-900 font-semibold">{selectedCompany.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription Plan
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${getPlanColor(selectedCompany.plan)}`}>
                      {getPlanIcon(selectedCompany.plan)}
                      <span className="ml-1">{selectedCompany.plan}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Badge variant={getStatusColor(selectedCompany.status)}>
                    {getTranslatedStatus(selectedCompany.status)}
                  </Badge>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver Limit
                  </label>
                  <p className="text-gray-900">{selectedCompany.driverLimit}</p>
                </div>

                {selectedCompany.currentDriverCount !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Drivers
                    </label>
                    <p className="text-gray-900">{selectedCompany.currentDriverCount}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created Date
                  </label>
                  <p className="text-gray-900">{new Date(selectedCompany.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Updated
                  </label>
                  <p className="text-gray-900">{new Date(selectedCompany.updatedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowViewModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditCompany(selectedCompany);
                    }}
                    className="flex-1"
                  >
                    Edit Company
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Company Modal */}
        {showEditModal && selectedCompany && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-16"
            onClick={() => setShowEditModal(false)}
          >
            <div
              className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Company</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription Plan
                  </label>
                  <select
                    value={editFormData.plan}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, plan: e.target.value as 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="STARTER">Starter</option>
                    <option value="PROFESSIONAL">Professional</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver Limit
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10000"
                    value={editFormData.driverLimit}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, driverLimit: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter driver limit"
                  />
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
                    onClick={() => setShowEditModal(false)}
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
                    {submitting ? 'Updating...' : 'Update Company'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      </div>
  );
}