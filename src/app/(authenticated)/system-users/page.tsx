'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usersApi, api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Toast from '@/components/ui/Toast';
import type { User } from '@/types';
import { UserStatus } from '@/types';

export default function SystemUsersPage() {
  const { t } = useTranslation(['common', 'users']);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN',
    companyId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    loadSystemUsers();
    loadCompanies();
  }, []);

  const loadSystemUsers = async () => {
    try {
      setLoading(true);
      // Get all users - Super Admin sees all by default (max limit is 100)
      const response = await usersApi.getUsers({ limit: 100 });

      if (response.success && response.data) {
        const allUsersData = response.data.data || response.data || [];
        const allUsersList = Array.isArray(allUsersData) ? allUsersData : [];

        // Filter to only show ADMIN and SUPER_ADMIN roles
        const systemUsers = allUsersList.filter((user: User) =>
          user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
        );

        setUsers(systemUsers);
      }
      setError('');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load system users';
      setError(errorMsg);
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await api.get('/companies');
      if (response.data.success && response.data.data) {
        setCompanies(response.data.data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load companies:', err);
    }
  };

  const handleAddUser = () => {
    setFormData({ name: '', email: '', password: '', role: 'ADMIN', companyId: '' });
    setError('');
    setShowAddModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    // Handle companyId which can be string or object
    const companyIdValue = typeof user.companyId === 'object' && user.companyId !== null
      ? (user.companyId._id || user.companyId.id || '')
      : (user.companyId || '');

    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't populate password
      role: user.role as 'ADMIN' | 'SUPER_ADMIN',
      companyId: companyIdValue
    });
    setError('');
    setShowEditModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validation
    if (formData.role === 'ADMIN' && !formData.companyId) {
      setError(t('users:errors.companyRequired'));
      setSubmitting(false);
      return;
    }

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'ADMIN' ? { companyId: formData.companyId } : {})
      };

      const response = await usersApi.createUser(userData);

      if (response.success) {
        setUsers(prev => [response.data, ...prev]);
        setFormData({ name: '', email: '', password: '', role: 'ADMIN', companyId: '' });
        setShowAddModal(false);
        setToast({
          message: t('users:success.userCreated', { name: formData.name }),
          type: 'success'
        });
      } else {
        setError(response.message || t('users:errors.createFailed'));
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || t('users:errors.createFailed');
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSubmitting(true);
    setError('');

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        ...(formData.password ? { password: formData.password } : {}),
        ...(formData.role === 'ADMIN' ? { companyId: formData.companyId } : {})
      };

      const response = await usersApi.updateUser(selectedUser._id, updateData);

      if (response.success) {
        setUsers(prev => prev.map(u => u._id === selectedUser._id ? response.data : u));
        setShowEditModal(false);
        setSelectedUser(null);
        setToast({
          message: t('users:success.userUpdated', { name: formData.name }),
          type: 'success'
        });
      } else {
        setError(response.message || t('users:errors.updateFailed'));
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || t('users:errors.updateFailed');
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (user: User) => {
    if (!confirm(t('users:confirmDeactivate', { name: user.name }))) return;

    try {
      const response = await usersApi.deleteUser(user._id);

      if (response.success) {
        setUsers(prev => prev.map(u =>
          u._id === user._id ? { ...u, status: UserStatus.INACTIVE } : u
        ));
        setToast({
          message: t('users:success.userDeactivated', { name: user.name }),
          type: 'success'
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || t('users:errors.deactivateFailed');
      setToast({ message: errorMsg, type: 'error' });
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(t('users:confirmDelete', { name: user.name }))) return;

    try {
      const response = await usersApi.deleteUser(user._id);

      if (response.success) {
        setUsers(prev => prev.filter(u => u._id !== user._id));
        setToast({
          message: t('users:success.userDeleted', { name: user.name }),
          type: 'success'
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || t('users:errors.deleteFailed');
      setToast({ message: errorMsg, type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const superAdmins = users.filter(u => u.role === 'SUPER_ADMIN');
  const admins = users.filter(u => u.role === 'ADMIN');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('users:systemUsers')}</h1>
          <p className="text-gray-600 mt-1">{t('users:systemUsersDescription')}</p>
        </div>
        <Button onClick={handleAddUser}>
          {t('users:addSystemUser')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <div className="text-sm text-gray-600">{t('users:totalSystemUsers')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">{superAdmins.length}</div>
            <div className="text-sm text-gray-600">{t('users:superAdmins')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{admins.length}</div>
            <div className="text-sm text-gray-600">{t('users:companyAdmins')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && !showAddModal && !showEditModal && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('users:systemUsersList')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common:name')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common:email')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common:role')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common:company')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common:status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common:actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.role === 'SUPER_ADMIN' ? 'info' : 'secondary'}>
                        {user.role === 'SUPER_ADMIN' ? t('users:superAdmin') : t('users:admin')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {typeof user.companyId === 'object' && user.companyId !== null && '_id' in user.companyId ? (user.companyId as any).name : (user.companyId || '-')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.status === 'ACTIVE' ? 'success' : 'default'}>
                        {user.status || 'ACTIVE'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user)}
                      >
                        {t('common:edit')}
                      </Button>
                      {user.status === 'ACTIVE' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeactivate(user)}
                        >
                          {t('common:deactivate')}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(user)}
                        >
                          {t('common:delete')}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      {t('users:noSystemUsers')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{t('users:addSystemUser')}</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('common:name')}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('common:email')}
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('common:password')}
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('common:role')}
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'SUPER_ADMIN' })}
                  >
                    <option value="ADMIN">{t('users:admin')}</option>
                    <option value="SUPER_ADMIN">{t('users:superAdmin')}</option>
                  </select>
                </div>

                {formData.role === 'ADMIN' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('common:company')}
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.companyId}
                      onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    >
                      <option value="">{t('users:selectCompany')}</option>
                      {companies.map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setError('');
                  }}
                  disabled={submitting}
                >
                  {t('common:cancel')}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? t('common:creating') : t('common:create')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{t('users:editUser')}</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('common:name')}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('common:email')}
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('users:newPassword')} ({t('common:optional')})
                  </label>
                  <input
                    type="password"
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={t('users:leaveBlankToKeep')}
                  />
                </div>

                {formData.role === 'ADMIN' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('common:company')}
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={formData.companyId}
                      onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    >
                      <option value="">{t('users:selectCompany')}</option>
                      {companies.map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                    setError('');
                  }}
                  disabled={submitting}
                >
                  {t('common:cancel')}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? t('common:updating') : t('common:update')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
