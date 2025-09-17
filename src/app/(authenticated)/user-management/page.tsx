'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';
import { api, authApi } from '@/lib/api';
import type { Role, User } from '@fleetflow/types';
import { UserRole } from '@fleetflow/types';

interface UserWithRoles extends User {
  assignedRoles?: Role[];
}

interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole | '';
  assignedRoleIds: string[];
  roleType: 'system' | 'custom';
  companyId?: string;
}

interface AssignRoleFormData {
  userId: string;
  roleIds: string[];
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create user modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateUserFormData>({
    name: '',
    email: '',
    password: '',
    role: '',
    assignedRoleIds: [],
    roleType: 'system',
    companyId: ''
  });

  // Assign roles modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [assignFormData, setAssignFormData] = useState<AssignRoleFormData>({
    userId: '',
    roleIds: []
  });

  useEffect(() => {
    loadData();
    // Reload data when the page gets focus (e.g., after creating a role)
    const handleFocus = () => {
      loadData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUserResponse = await authApi.getMe();
      setCurrentUser(currentUserResponse);

      const requests = [
        api.get('/users'),
        api.get('/roles')
      ];

      // Load companies only for Super Admins
      if (currentUserResponse.role === 'SUPER_ADMIN') {
        requests.push(api.get('/companies'));
      }

      const responses = await Promise.all(requests);
      const [usersResponse, rolesResponse, companiesResponse] = responses;

      if (usersResponse.data.success) {
        setUsers(usersResponse.data.data?.data || []);
      }

      if (rolesResponse.data.success) {
        // The response might be in different formats, let's handle both
        const responseData = rolesResponse.data.data;
        console.log('Raw roles response:', rolesResponse.data);
        console.log('Response data structure:', responseData);

        let allRoles: Role[] = [];

        // Check if it's directly an array or has a data property
        if (Array.isArray(responseData)) {
          allRoles = responseData;
          console.log('Roles are directly an array');
        } else if (responseData && Array.isArray(responseData.data)) {
          allRoles = responseData.data;
          console.log('Roles are in responseData.data');
        } else if (responseData) {
          // It might be a single object, convert to array
          allRoles = [responseData];
          console.log('Single role object, converted to array');
        }

        // Debug: Log all roles to see what's coming from the backend
        console.log('All roles from backend:', allRoles);
        console.log('Role details:', allRoles.map((r: Role) => ({
          name: r.name,
          displayName: r.displayName,
          isSystem: r.isSystem,
          companyId: r.companyId
        })));

        // IMPORTANT: Only show CUSTOM roles (non-system roles) for assignment
        // System roles are assigned directly when creating the user, not through assign-multiple
        let customRoles = allRoles.filter((role: Role) => !role.isSystem);
        console.log('After filtering for custom (non-system) roles:', customRoles.length, 'roles');

        // Re-enable company filtering for custom roles
        // Further filter by company if not Super Admin
        if (currentUserResponse.role !== 'SUPER_ADMIN' && currentUserResponse.companyId) {
          const beforeCompanyFilter = customRoles.length;
          const userCompanyId = typeof currentUserResponse.companyId === 'object'
            ? (currentUserResponse.companyId._id || currentUserResponse.companyId.id)
            : currentUserResponse.companyId;

          console.log('User companyId:', userCompanyId, 'Type:', typeof currentUserResponse.companyId);
          console.log('Comparing with role companyIds:', customRoles.map(r => ({
            name: r.name,
            displayName: r.displayName,
            companyId: r.companyId,
            companyIdType: typeof r.companyId
          })));

          // Filter custom roles by company
          customRoles = customRoles.filter((role: Role) => {
            // Custom roles should have a companyId
            if (!role.companyId) return false;

            const roleCompanyId = typeof role.companyId === 'object'
              ? (role.companyId._id || role.companyId.id || role.companyId)
              : role.companyId;
            return roleCompanyId === userCompanyId;
          });
          console.log(`After company filter (companyId: ${userCompanyId}):`, customRoles.length, 'roles (was', beforeCompanyFilter, ')');
        }

        console.log('Custom roles available for assignment:', customRoles);
        setRoles(customRoles);
      }

      if (companiesResponse && companiesResponse.data.success) {
        setCompanies(companiesResponse.data.data?.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (createFormData.roleType === 'system' && !createFormData.role) {
      setError('Please select a system role');
      return;
    }

    if (createFormData.roleType === 'custom' && createFormData.assignedRoleIds.length === 0) {
      setError('Please select a custom role');
      return;
    }

    if (currentUser?.role === 'SUPER_ADMIN' && createFormData.roleType === 'system' && !createFormData.companyId) {
      setError('Please select a company for the admin');
      return;
    }

    try {
      setCreateLoading(true);

      let userData;
      if (createFormData.roleType === 'system') {
        // Creating user with system role
        userData = {
          name: createFormData.name,
          email: createFormData.email,
          password: createFormData.password,
          role: createFormData.role,
          ...(createFormData.companyId && { companyId: createFormData.companyId })
        };
      } else {
        // Creating user with custom role - assign DRIVER as default system role
        userData = {
          name: createFormData.name,
          email: createFormData.email,
          password: createFormData.password,
          role: UserRole.DRIVER, // Default system role when using custom roles
          ...(createFormData.companyId && { companyId: createFormData.companyId })
        };
      }

      const response = await api.post('/users', userData);

      if (response.data.success) {
        // If custom role type is selected, assign the custom roles
        if (createFormData.roleType === 'custom' && createFormData.assignedRoleIds.length > 0) {
          await api.post('/roles/assign-multiple', {
            userId: response.data.data._id,
            roleIds: createFormData.assignedRoleIds
          });
        }

        setShowCreateModal(false);
        setCreateFormData({
          name: '',
          email: '',
          password: '',
          role: '',
          assignedRoleIds: [],
          roleType: 'system',
          companyId: ''
        });
        await loadData();
      } else {
        setError(response.data.message || 'Failed to create user');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAssignRoles = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post('/roles/assign-multiple', {
        userId: assignFormData.userId,
        roleIds: assignFormData.roleIds
      });

      if (response.data.success) {
        setShowAssignModal(false);
        setSelectedUser(null);
        await loadData();
      } else {
        setError(response.data.message || 'Failed to assign roles');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to assign roles');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Confirm permanent deletion
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone and will remove all associated data.')) {
      return;
    }

    try {
      // Always do hard delete to actually remove from database
      const response = await api.delete(`/users/${userId}?hard=true`);

      if (response.data.success) {
        await loadData();
        setError(''); // Clear any previous errors
      } else {
        setError(response.data.message || 'Failed to delete user');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete user');
    }
  };

  const openAssignModal = (user: UserWithRoles) => {
    setSelectedUser(user);
    setAssignFormData({
      userId: user._id,
      roleIds: user.assignedRoles?.filter(r => !r.isSystem).map(r => r._id) || []
    });
    setShowAssignModal(true);
  };

  const getRoleBadgeColor = (role: UserRole): string => {
    switch (role) {
      case UserRole.SUPER_ADMIN: return 'bg-red-100 text-red-800';
      case UserRole.ADMIN: return 'bg-blue-100 text-blue-800';
      case UserRole.MANAGER: return 'bg-green-100 text-green-800';
      case UserRole.VIEWER: return 'bg-gray-100 text-gray-800';
      case UserRole.DRIVER: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              {currentUser?.role === 'SUPER_ADMIN' ? 'Admin Management' : 'User Management'}
            </h1>
            <p className="text-secondary-600 mt-1">
              {currentUser?.role === 'SUPER_ADMIN'
                ? 'Manage company administrators and assign roles'
                : 'Manage company users and assign roles to control access'
              }
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => loadData()}
              title="Refresh data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {currentUser?.role === 'SUPER_ADMIN' ? 'Create Admin' : 'Create User'}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <div className="mt-4">
                  <Button
                    onClick={() => setError(null)}
                    size="sm"
                    variant="outline"
                    className="text-red-800 border-red-300 hover:bg-red-50"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-secondary-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-secondary-900 mb-1">No users found</h3>
                <p className="text-secondary-500">Create your first user to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Base Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Active Roles</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-secondary-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-secondary-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-700">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-secondary-900">{user.name}</div>
                              <div className="text-sm text-secondary-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`${getRoleBadgeColor(user.role)} ${user.assignedRoles && user.assignedRoles.filter(role => !role.isSystem).length > 0 ? 'opacity-50' : ''}`}>
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.assignedRoles && user.assignedRoles.filter(role => !role.isSystem).length > 0 ? (
                              user.assignedRoles
                                .filter(role => !role.isSystem)
                                .map((role) => (
                                  <Badge key={role._id} className="bg-primary-100 text-primary-800 text-xs font-medium">
                                    {role.displayName} (Primary)
                                  </Badge>
                                ))
                            ) : (
                              <Badge className={`${getRoleBadgeColor(user.role)} text-xs font-medium`}>
                                {user.role.replace('_', ' ')} (Active)
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAssignModal(user)}
                            >
                              Manage Custom Roles
                            </Button>
                            {user.role !== UserRole.SUPER_ADMIN && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Create New User</h3>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({...createFormData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({...createFormData, password: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Role Type
                </label>
                <div className="bg-blue-50 p-3 rounded-md mb-3 text-xs text-blue-800">
                  <p className="mb-1"><strong>System Roles:</strong> Built-in roles that define base permissions (Super Admin, Admin, Manager, Driver, Viewer)</p>
                  <p><strong>Custom Roles:</strong> Additional roles created in Role Management for specialized permissions (e.g., FLEET_MANAGER)</p>
                </div>
                <div className="flex space-x-4 mb-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="roleType"
                      value="system"
                      checked={createFormData.roleType === 'system'}
                      onChange={(e) => setCreateFormData({
                        ...createFormData,
                        roleType: e.target.value as 'system' | 'custom',
                        role: '',
                        assignedRoleIds: []
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-secondary-700">System Role (Primary)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="roleType"
                      value="custom"
                      checked={createFormData.roleType === 'custom'}
                      onChange={(e) => setCreateFormData({
                        ...createFormData,
                        roleType: e.target.value as 'system' | 'custom',
                        role: '',
                        assignedRoleIds: []
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-secondary-700">Custom Role (Additional)</span>
                  </label>
                </div>
              </div>

              {createFormData.roleType === 'system' ? (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Select System Role
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={createFormData.role}
                    onChange={(e) => setCreateFormData({...createFormData, role: e.target.value as UserRole})}
                  >
                    <option value="">-- Select System Role --</option>
                    {currentUser?.role === 'SUPER_ADMIN' ? (
                      // Super Admin can create all system roles
                      <>
                        <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                        <option value={UserRole.ADMIN}>Admin</option>
                        <option value={UserRole.MANAGER}>Manager</option>
                        <option value={UserRole.DRIVER}>Driver</option>
                        <option value={UserRole.VIEWER}>Viewer</option>
                      </>
                    ) : (
                      // Regular Admin can create these company-level users
                      <>
                        <option value={UserRole.MANAGER}>Manager</option>
                        <option value={UserRole.DRIVER}>Driver</option>
                        <option value={UserRole.VIEWER}>Viewer</option>
                      </>
                    )}
                  </select>
                  
                  {/* Company selection for Super Admins creating Admins */}
                  {currentUser?.role === 'SUPER_ADMIN' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Select Company
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={createFormData.companyId}
                        onChange={(e) => setCreateFormData({...createFormData, companyId: e.target.value})}
                      >
                        <option value="">-- Select Company --</option>
                        {companies.map((company) => (
                          <option key={company._id} value={company._id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Select Custom Role
                  </label>
                  <div className="text-xs text-secondary-500 mb-2">
                    Custom roles provide additional permissions beyond the base system role. Create custom roles in the Role Management page.
                  </div>
                  <div className="max-h-32 overflow-y-auto border border-secondary-200 rounded-md p-2">
                    {roles.length === 0 ? (
                      <div className="text-center p-4">
                        <p className="text-sm text-secondary-600 mb-2">No custom roles available</p>
                        <p className="text-xs text-secondary-500">Create custom roles in the Role Management page first, then refresh this page.</p>
                      </div>
                    ) : (
                      roles.map((role) => (
                        <label key={role._id} className="flex items-center space-x-2 py-1">
                          <input
                            type="radio"
                            name="customRole"
                            checked={createFormData.assignedRoleIds.includes(role._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCreateFormData({
                                  ...createFormData,
                                  assignedRoleIds: [role._id] // Only one custom role
                                });
                              }
                            }}
                            className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                          />
                          <div>
                            <div className="text-sm font-medium text-secondary-700">{role.displayName}</div>
                            <div className="text-xs text-secondary-500">{role.description}</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  
                  {/* Company selection for Super Admins creating users with custom roles */}
                  {currentUser?.role === 'SUPER_ADMIN' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Select Company
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={createFormData.companyId}
                        onChange={(e) => setCreateFormData({...createFormData, companyId: e.target.value})}
                      >
                        <option value="">-- Select Company --</option>
                        {companies.map((company) => (
                          <option key={company._id} value={company._id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={createLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700"
                  disabled={createLoading}
                >
                  {createLoading ? (
                    <div className="flex items-center space-x-2">
                      <Spinner size="sm" />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Roles Modal */}
      {showAssignModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Manage Custom Roles for {selectedUser.name}
            </h3>
            
            <form onSubmit={handleAssignRoles} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Custom Roles
                </label>
                <div className="max-h-48 overflow-y-auto border border-secondary-200 rounded-md p-2">
                  {roles.map((role) => (
                    <label key={role._id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={assignFormData.roleIds.includes(role._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignFormData({
                              ...assignFormData,
                              roleIds: [...assignFormData.roleIds, role._id]
                            });
                          } else {
                            setAssignFormData({
                              ...assignFormData,
                              roleIds: assignFormData.roleIds.filter(id => id !== role._id)
                            });
                          }
                        }}
                        className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-secondary-700">{role.displayName}</div>
                        <div className="text-xs text-secondary-500">{role.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  Update Custom Roles
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}