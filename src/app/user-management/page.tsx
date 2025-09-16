'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
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
        const allRoles = rolesResponse.data.data.data || [];
        let customRoles;
        
        if (currentUserResponse.role === 'SUPER_ADMIN') {
          // Super Admin can see all custom roles (both system-wide and company-specific)
          customRoles = allRoles.filter(role => !role.isSystem);
        } else {
          // Regular Admin can only see custom roles for their company
          customRoles = allRoles.filter(role => !role.isSystem && role.companyId === currentUserResponse.companyId);
        }
        
        setRoles(customRoles);
      }
      
      if (companiesResponse && companiesResponse.data.success) {
        setCompanies(companiesResponse.data.data?.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading data');
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
          roleType: 'system'
        });
        await loadData();
      } else {
        setError(response.data.message || 'Failed to create user');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
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
      setError(err.message || 'An error occurred');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await api.delete(`/users/${userId}`);
      
      if (response.data.success) {
        await loadData();
      } else {
        setError(response.data.message || 'Failed to delete user');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
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
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
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
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {currentUser?.role === 'SUPER_ADMIN' ? 'Create Admin' : 'Create User'}
          </Button>
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
                    <span className="text-sm text-secondary-700">System Role</span>
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
                    <span className="text-sm text-secondary-700">Custom Role</span>
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
                        <option value={UserRole.ADMIN}>Admin</option>
                        <option value={UserRole.MANAGER}>Manager</option>
                        <option value={UserRole.VIEWER}>Viewer</option>
                        <option value={UserRole.DRIVER}>Driver</option>
                      </>
                    ) : (
                      // Regular Admin can create these company-level users
                      <>
                        <option value={UserRole.MANAGER}>Manager</option>
                        <option value={UserRole.VIEWER}>Viewer</option>
                        <option value={UserRole.DRIVER}>Driver</option>
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
                  <div className="max-h-32 overflow-y-auto border border-secondary-200 rounded-md p-2">
                    {roles.length === 0 ? (
                      <p className="text-sm text-secondary-500 p-2">No custom roles available. Create roles in Role Management first.</p>
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
    </DashboardLayout>
  );
}