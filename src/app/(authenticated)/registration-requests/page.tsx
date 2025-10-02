'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';

interface RegistrationEmail {
  _id: string;
  email: string;
  company?: string;
  message?: string;
  status: 'pending' | 'contacted' | 'converted';
  createdAt: string;
}

export default function RegistrationRequestsPage() {
  const [registrationEmails, setRegistrationEmails] = useState<RegistrationEmail[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<RegistrationEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'email'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<RegistrationEmail | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    loadRegistrationEmails();
  }, []);

  // Apply filters, search, and sorting
  useEffect(() => {
    let result = [...registrationEmails];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(email =>
        email.email.toLowerCase().includes(query) ||
        email.company?.toLowerCase().includes(query) ||
        email.message?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(email => email.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredEmails(result);
  }, [registrationEmails, searchQuery, statusFilter, sortBy, sortOrder]);

  const loadRegistrationEmails = async () => {
    try {
      setLoading(true);
      const response = await api.get('/registration-emails');

      if (response.data?.success && response.data?.data?.emails) {
        setRegistrationEmails(response.data.data.emails);
      } else {
        setError('Failed to load registration requests');
      }
    } catch (err: any) {
      console.error('Failed to fetch registration emails:', err);
      setError(err.response?.data?.message || 'Failed to load registration requests');
    } finally {
      setLoading(false);
    }
  };

  const updateEmailStatus = async (emailId: string, status: 'pending' | 'contacted' | 'converted') => {
    try {
      const response = await api.patch(`/registration-emails/${emailId}`, { status });
      if (response.data.success) {
        setRegistrationEmails(prev =>
          prev.map(email =>
            email._id === emailId ? { ...email, status } : email
          )
        );
      }
    } catch (error) {
      console.error('Failed to update email status:', error);
      alert('Failed to update email status');
    }
  };

  const handleViewEmail = (email: RegistrationEmail) => {
    setSelectedEmail(email);
    setShowViewModal(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const activeFilterCount = [
    searchQuery,
    statusFilter !== 'ALL' ? statusFilter : null,
  ].filter(Boolean).length;

  const getEmailStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'contacted':
        return 'info';
      case 'converted':
        return 'success';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading registration requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portal Registration Requests</h1>
          <p className="text-gray-600 mt-2">Manage and track all portal registration inquiries</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={loadRegistrationEmails}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{registrationEmails.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {registrationEmails.filter(e => e.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-blue-600">
                  {registrationEmails.filter(e => e.status === 'contacted').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Converted</p>
                <p className="text-2xl font-bold text-green-600">
                  {registrationEmails.filter(e => e.status === 'converted').length}
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
                placeholder="Search by email, company name, or message..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="ALL">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'email')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="createdAt">Date Received</option>
                      <option value="email">Email</option>
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
            Showing <span className="font-semibold">{filteredEmails.length}</span> of <span className="font-semibold">{registrationEmails.length}</span> requests
          </div>
        </CardContent>
      </Card>

      {/* Registration Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>All Registration Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {filteredEmails.length > 0 ? (
            <div className="space-y-4">
              {filteredEmails.map((email) => (
                <div key={email._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 truncate">{email.email}</h3>
                        <Badge variant={getEmailStatusColor(email.status)}>
                          {email.status}
                        </Badge>
                      </div>
                      {email.company && (
                        <p className="text-sm text-gray-600 truncate">Company: {email.company}</p>
                      )}
                      {email.message && (
                        <p className="text-sm text-gray-500 truncate max-w-md">
                          Message: {email.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Received: {formatDate(new Date(email.createdAt))}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewEmail(email)}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </Button>

                    {email.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateEmailStatus(email._id, 'contacted')}
                        >
                          Mark Contacted
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateEmailStatus(email._id, 'converted')}
                        >
                          Mark Converted
                        </Button>
                      </>
                    )}
                    {email.status === 'contacted' && (
                      <Button
                        size="sm"
                        onClick={() => updateEmailStatus(email._id, 'converted')}
                      >
                        Mark Converted
                      </Button>
                    )}
                    {email.status === 'converted' && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium">Converted</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                {registrationEmails.length === 0 ? '📧' : '🔍'}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {registrationEmails.length === 0 ? 'No registration requests yet' : 'No matching requests'}
              </h3>
              <p className="text-gray-500 mb-6">
                {registrationEmails.length === 0
                  ? 'Portal registration requests will appear here when users submit inquiries.'
                  : 'Try adjusting your filters or search query to find what you\'re looking for.'
                }
              </p>
              {registrationEmails.length > 0 && (
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

      {/* View Email Modal */}
      {showViewModal && selectedEmail && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-16"
          onClick={() => setShowViewModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Registration Request Details</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <p className="text-gray-900 font-semibold">{selectedEmail.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Badge variant={getEmailStatusColor(selectedEmail.status)}>
                  {selectedEmail.status}
                </Badge>
              </div>

              {selectedEmail.company && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <p className="text-gray-900">{selectedEmail.company}</p>
                </div>
              )}

              {selectedEmail.message && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedEmail.message}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Received Date</label>
                <p className="text-gray-900">{formatDate(new Date(selectedEmail.createdAt))}</p>
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                {selectedEmail.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateEmailStatus(selectedEmail._id, 'contacted');
                        setShowViewModal(false);
                      }}
                      className="flex-1"
                    >
                      Mark as Contacted
                    </Button>
                    <Button
                      onClick={() => {
                        updateEmailStatus(selectedEmail._id, 'converted');
                        setShowViewModal(false);
                      }}
                      className="flex-1"
                    >
                      Mark as Converted
                    </Button>
                  </>
                )}
                {selectedEmail.status === 'contacted' && (
                  <Button
                    onClick={() => {
                      updateEmailStatus(selectedEmail._id, 'converted');
                      setShowViewModal(false);
                    }}
                    className="flex-1"
                  >
                    Mark as Converted
                  </Button>
                )}
                {selectedEmail.status === 'converted' && (
                  <Button variant="outline" onClick={() => setShowViewModal(false)} className="flex-1">
                    Close
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
