'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Role, User } from '@/types';
import { Permission } from '@/types';

interface RoleWithUsers extends Role {
  userCount?: number;
  users?: User[];
}

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<RoleWithUsers[]>([]);
  const [permissions, setPermissions] = useState<{all: Permission[], grouped: Record<string, Permission[]>} | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleWithUsers | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [createFormData, setCreateFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [] as Permission[]
  });

  const [editFormData, setEditFormData] = useState({
    displayName: '',
    description: '',
    permissions: [] as Permission[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesResponse, permissionsResponse, userResponse] = await Promise.all([
        api.get('/roles'),
        api.get('/roles/permissions'),
        api.get('/auth/me')
      ]);

      if (rolesResponse.data.success) {
        setRoles(rolesResponse.data.data.data || []);
      }

      if (permissionsResponse.data.success) {
        setPermissions(permissionsResponse.data.data);
      }

      if (userResponse.data.success) {
        setCurrentUser(userResponse.data.data);
      }
    } catch (err: any) {
      console.error('Error loading role data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!createFormData.name || !createFormData.displayName || !createFormData.description) {
      setError('Please fill in all required fields');
      return;
    }

    if (createFormData.permissions.length === 0) {
      setError('Please select at least one permission');
      return;
    }

    // Validate name format (uppercase letters and underscores only)
    if (!/^[A-Z_]+$/.test(createFormData.name)) {
      setError('Role name must contain only uppercase letters and underscores (e.g., FLEET_MANAGER)');
      return;
    }

    try {
      // Extract companyId properly - it might be an object or a string
      const companyId = typeof currentUser?.companyId === 'object'
        ? currentUser.companyId._id || currentUser.companyId.id
        : currentUser?.companyId;

      const roleData = {
        name: createFormData.name,
        displayName: createFormData.displayName,
        description: createFormData.description,
        permissions: createFormData.permissions,
        // For regular Admins, always include their companyId to create company-specific custom roles
        // For Super Admins, also include companyId if they have one (they might be testing in a company context)
        ...(companyId && { companyId })
      };

      console.log('Creating role with data:', roleData);
      console.log('CompanyId type:', typeof companyId, 'value:', companyId);

      const response = await api.post('/roles', roleData);

      if (response.data.success) {
        setShowCreateModal(false);
        setCreateFormData({
          name: '',
          displayName: '',
          description: '',
          permissions: []
        });
        await loadData();
      } else {
        setError(response.data.message || 'Failed to create role');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create role');
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) return;

    try {
      const response = await api.put(`/roles/${selectedRole._id}`, editFormData);

      if (response.data.success) {
        setShowEditModal(false);
        setSelectedRole(null);
        await loadData();
      } else {
        setError(response.data.message || 'Failed to update role');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update role');
    }
  };

  const handleDeleteRole = async (roleId: string, forceDelete: boolean = false) => {
    if (!forceDelete && !confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    }

    try {
      const url = forceDelete ? `/roles/${roleId}?force=true` : `/roles/${roleId}`;
      const response = await api.delete(url);

      if (response.data.success) {
        await loadData();
        setError(''); // Clear any previous errors
      } else {
        setError(response.data.message || 'Failed to delete role');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete role';

      // If role has assignments, ask if user wants to force delete
      if (errorMessage.includes('assigned to') && errorMessage.includes('user(s)')) {
        const forceConfirm = confirm(
          `${errorMessage}\n\nDo you want to force delete this role and remove all assignments?`
        );

        if (forceConfirm) {
          handleDeleteRole(roleId, true);
        }
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleEditRole = (role: RoleWithUsers) => {
    setSelectedRole(role);
    setEditFormData({
      displayName: role.displayName,
      description: role.description,
      permissions: [...role.permissions]
    });
    setShowEditModal(true);
  };

  const handlePermissionToggle = (permission: Permission, isCreate: boolean = false) => {
    if (isCreate) {
      setCreateFormData(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission]
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission]
      }));
    }
  };

  const getPermissionDescription = (permission: Permission): string => {
    const descriptions: Record<Permission, string> = {
      [Permission.COMPANY_CREATE]: 'Create new companies',
      [Permission.COMPANY_READ]: 'View company information',
      [Permission.COMPANY_UPDATE]: 'Edit company details',
      [Permission.COMPANY_DELETE]: 'Delete companies',
      [Permission.USER_CREATE]: 'Create new users',
      [Permission.USER_READ]: 'View user information',
      [Permission.USER_UPDATE]: 'Edit user details',
      [Permission.USER_DELETE]: 'Delete users',
      [Permission.USER_ASSIGN_ROLE]: 'Assign roles to users',
      [Permission.DRIVER_CREATE]: 'Create new drivers',
      [Permission.DRIVER_READ]: 'View driver information',
      [Permission.DRIVER_UPDATE]: 'Edit driver details',
      [Permission.DRIVER_DELETE]: 'Delete drivers',
      [Permission.VEHICLE_CREATE]: 'Add new vehicles',
      [Permission.VEHICLE_READ]: 'View vehicle information',
      [Permission.VEHICLE_UPDATE]: 'Edit vehicle details',
      [Permission.VEHICLE_DELETE]: 'Delete vehicles',
      [Permission.VEHICLE_ASSIGN]: 'Assign vehicles to drivers',
      [Permission.EXPENSE_CREATE]: 'Create new expenses',
      [Permission.EXPENSE_READ]: 'View expenses',
      [Permission.EXPENSE_UPDATE]: 'Edit expenses',
      [Permission.EXPENSE_DELETE]: 'Delete expenses',
      [Permission.EXPENSE_APPROVE]: 'Approve expenses',
      [Permission.EXPENSE_EXPORT]: 'Export expense data',
      [Permission.REPORT_VIEW]: 'View reports',
      [Permission.REPORT_EXPORT]: 'Export reports',
      [Permission.DASHBOARD_VIEW]: 'Access dashboard',
      [Permission.SYSTEM_SETTINGS]: 'Manage system settings',
      [Permission.AUDIT_LOG_VIEW]: 'View audit logs',
      [Permission.ROLE_MANAGEMENT]: 'Manage roles and permissions'
    };
    return descriptions[permission] || permission;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading role management...</p>
          </div>
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
              <h3 className="text-sm font-medium text-red-800">Error Loading Roles</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <Button onClick={loadData} className="mt-4">
            Retry
          </Button>
        </div>
    );
  }

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
            <p className="text-gray-600 mt-2">Manage user roles and permissions</p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            Create Role
          </Button>
        </div>

        {/* Roles List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roles.map((role) => (
            <Card key={role._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {role.displayName}
                      {role.isSystem && (
                        <Badge variant="secondary" className="text-xs">
                          System
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    {!role.isSystem && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRole(role._id, false)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </>
                    )}
                    {role.isSystem && (
                      <span className="text-xs text-gray-500 italic">System role (read-only)</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Permissions ({role.permissions.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 6).map((permission) => (
                        <Badge key={permission} variant="default" className="text-xs">
                          {permission.replace(/_/g, ' ').toLowerCase()}
                        </Badge>
                      ))}
                      {role.permissions.length > 6 && (
                        <Badge variant="default" className="text-xs">
                          +{role.permissions.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {formatDate(new Date(role.createdAt))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Role Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-20">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Create New Role</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowCreateModal(false)}
                  >
                    ✕
                  </Button>
                </div>

                <form onSubmit={handleCreateRole} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Name (Internal)
                    </label>
                    <input
                      type="text"
                      value={createFormData.name}
                      onChange={(e) => {
                        // Only allow uppercase letters and underscores
                        const value = e.target.value.toUpperCase().replace(/[^A-Z_]/g, '');
                        setCreateFormData(prev => ({ ...prev, name: value }));
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g., FLEET_MANAGER"
                      pattern="[A-Z_]+"
                      title="Only uppercase letters and underscores allowed"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use uppercase letters and underscores only (e.g., FLEET_MANAGER, EXPENSE_APPROVER)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={createFormData.displayName}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Fleet Manager"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={createFormData.description}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                      placeholder="Describe what this role is for..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Permissions <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Select at least one permission for this role. Permissions determine what actions users with this role can perform.
                    </p>
                    {permissions && Object.entries(permissions.grouped).map(([category, perms]) => (
                      <div key={category} className="mb-4">
                        <h4 className="font-medium text-gray-800 mb-2 capitalize">
                          {category} Permissions
                        </h4>
                        <div className="space-y-2">
                          {perms.map((permission) => (
                            <label key={permission} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={createFormData.permissions.includes(permission)}
                                onChange={() => handlePermissionToggle(permission, true)}
                                className="mr-2"
                              />
                              <span className="text-sm">
                                {getPermissionDescription(permission)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateModal(false);
                        setError('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-primary-600 hover:bg-primary-700 text-white"
                      disabled={!createFormData.name || !createFormData.displayName || !createFormData.description || createFormData.permissions.length === 0}
                    >
                      Create Role
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Role Modal */}
        {showEditModal && selectedRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-20">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Edit Role: {selectedRole.displayName}</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowEditModal(false)}
                  >
                    ✕
                  </Button>
                </div>

                <form onSubmit={handleUpdateRole} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.displayName}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                      disabled={selectedRole.isSystem}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                      required
                      disabled={selectedRole.isSystem}
                    />
                  </div>

                  {!selectedRole.isSystem && permissions && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Permissions
                      </label>
                      {Object.entries(permissions.grouped).map(([category, perms]) => (
                        <div key={category} className="mb-4">
                          <h4 className="font-medium text-gray-800 mb-2 capitalize">
                            {category} Permissions
                          </h4>
                          <div className="space-y-2">
                            {perms.map((permission) => (
                              <label key={permission} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={editFormData.permissions.includes(permission)}
                                  onChange={() => handlePermissionToggle(permission, false)}
                                  className="mr-2"
                                />
                                <span className="text-sm">
                                  {getPermissionDescription(permission)}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-primary-600 hover:bg-primary-700 text-white"
                      disabled={selectedRole.isSystem}
                    >
                      Update Role
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}