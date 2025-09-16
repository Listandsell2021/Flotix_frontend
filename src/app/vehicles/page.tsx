'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { vehiclesApi, usersApi } from '@/lib/api';
import type { Vehicle, User, CreateVehicleRequest, VehicleType } from '@fleetflow/types';

// Extended type for vehicle with populated driver(s)
interface VehicleWithDriver extends Omit<Vehicle, 'assignedDriverId' | 'assignedDriverIds'> {
  assignedDriverId?: string | {
    _id: string;
    name: string;
    email: string;
  };
  assignedDriverIds?: (string | {
    _id: string;
    name: string;
    email: string;
  })[];
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleWithDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithDriver | null>(null);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState<CreateVehicleRequest>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    vin: '',
    type: 'CAR' as VehicleType,
    currentOdometer: 0,
    fuelType: '',
    color: '',
  });

  useEffect(() => {
    loadVehicles();
    loadDrivers();
  }, []);

  const loadVehicles = async () => {
    try {
      const response = await vehiclesApi.getVehicles();
      if (response.success && response.data) {
        console.log('Vehicles loaded:', response.data.data);
        // Check what driver data we have
        response.data.data?.forEach((v: any) => {
          if (v.assignedDriverId || v.assignedDriverIds) {
            console.log(`Vehicle ${v.licensePlate}:`, {
              assignedDriverId: v.assignedDriverId,
              assignedDriverIds: v.assignedDriverIds
            });
          }
        });
        setVehicles(response.data.data || []);
      } else {
        setError('Failed to load vehicles');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      const response = await usersApi.getUsers({ role: 'DRIVER' });
      if (response.success && response.data) {
        setDrivers(response.data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load drivers:', err);
    }
  };

  const handleAssignVehicle = async () => {
    if (!selectedVehicle || selectedDriverIds.length === 0) {
      alert('Please select at least one driver');
      return;
    }

    setUpdating(true);
    try {
      const response = await vehiclesApi.assignVehicle(selectedVehicle._id, selectedDriverIds);
      if (response.success) {
        await loadVehicles();
        setShowAssignModal(false);
        setSelectedVehicle(null);
        setSelectedDriverIds([]);
        alert('Vehicle assigned successfully!');
      } else {
        alert(response.message || 'Failed to assign vehicle');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to assign vehicle');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateVehicle = async () => {
    if (!selectedVehicle) return;
    
    setUpdating(true);
    try {
      const response = await vehiclesApi.updateVehicle(selectedVehicle._id, {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        licensePlate: formData.licensePlate,
        vin: formData.vin || undefined,
        type: formData.type,
        currentOdometer: formData.currentOdometer,
        fuelType: formData.fuelType || undefined,
        color: formData.color || undefined,
      });
      
      if (response.success) {
        await loadVehicles();
        setShowEditModal(false);
        setSelectedVehicle(null);
        alert('Vehicle updated successfully!');
      } else {
        alert(response.message || 'Failed to update vehicle');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update vehicle');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateVehicle = async () => {
    if (!formData.make || !formData.model || !formData.licensePlate) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const vehicleData: CreateVehicleRequest = {
        ...formData,
        vin: formData.vin || undefined,
        fuelType: formData.fuelType || undefined,
        color: formData.color || undefined,
      };

      const response = await vehiclesApi.createVehicle(vehicleData);
      if (response.success) {
        await loadVehicles();
        setShowCreateModal(false);
        setFormData({
          make: '',
          model: '',
          year: new Date().getFullYear(),
          licensePlate: '',
          vin: '',
          type: 'CAR' as VehicleType,
          currentOdometer: 0,
          fuelType: '',
          color: '',
        });
        alert('Vehicle created successfully!');
      } else {
        alert(response.message || 'Failed to create vehicle');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create vehicle');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'MAINTENANCE':
        return 'warning';
      case 'RETIRED':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'CAR':
        return '🚗';
      case 'TRUCK':
        return '🚛';
      case 'VAN':
        return '🚐';
      case 'MOTORCYCLE':
        return '🏍️';
      default:
        return '🚗';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading vehicles...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading Vehicles</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE');
  const assignedVehicles = vehicles.filter(v => v.assignedDriverId);
  const totalOdometer = vehicles.reduce((sum, v) => sum + (v.currentOdometer || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fleet Management</h1>
            <p className="text-gray-600 mt-2">Manage your company vehicles and assignments</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Import Vehicles
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Vehicle
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                  <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🚗</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Vehicles</p>
                  <p className="text-2xl font-bold text-green-600">{activeVehicles.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Assigned</p>
                  <p className="text-2xl font-bold text-blue-600">{assignedVehicles.length}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {vehicles.length - assignedVehicles.length} available
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Mileage</p>
                  <p className="text-2xl font-bold text-purple-600">{totalOdometer.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">kilometers</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicles List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Vehicles ({vehicles.length})</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Filter</Button>
                <Button variant="outline" size="sm">Sort</Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vehicles.length > 0 ? (
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">
                        {getVehicleIcon(vehicle.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {vehicle.make} {vehicle.model} ({vehicle.year})
                        </h3>
                        <p className="text-sm text-gray-500">
                          {vehicle.licensePlate} • {vehicle.type}
                          {vehicle.color && ` • ${vehicle.color}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {vehicle.currentOdometer.toLocaleString()} km
                          {(vehicle.assignedDriverId || (vehicle.assignedDriverIds && vehicle.assignedDriverIds.length > 0)) && ' • Assigned'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge variant={getStatusColor(vehicle.status)}>
                          {vehicle.status}
                        </Badge>
                        {(() => {
                          // Check if we have populated assignedDriverIds
                          if (vehicle.assignedDriverIds && vehicle.assignedDriverIds.length > 0 && 
                              typeof vehicle.assignedDriverIds[0] === 'object') {
                            const driverNames = vehicle.assignedDriverIds.map(driver => 
                              typeof driver === 'object' ? driver.name : 'Unknown'
                            ).join(', ');
                            return (
                              <p className="text-sm text-gray-600 mt-1">
                                {vehicle.assignedDriverIds.length > 1 ? 'Drivers' : 'Driver'}: {driverNames}
                              </p>
                            );
                          } else if (vehicle.assignedDriverId) {
                            // Fallback to single driver
                            return (
                              <p className="text-sm text-gray-600 mt-1">
                                Driver: {typeof vehicle.assignedDriverId === 'object' 
                                  ? vehicle.assignedDriverId.name 
                                  : 'Unknown'}
                              </p>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            // Get all assigned driver IDs
                            const driverIds = vehicle.assignedDriverIds?.map(driver => 
                              typeof driver === 'object' ? driver._id : driver
                            ).filter(id => id) || [];
                            setSelectedDriverIds(driverIds);
                            setShowAssignModal(true);
                          }}
                        >
                          {vehicle.assignedDriverId ? 'Reassign' : 'Assign'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setFormData({
                              make: vehicle.make,
                              model: vehicle.model,
                              year: vehicle.year,
                              licensePlate: vehicle.licensePlate,
                              vin: vehicle.vin || '',
                              type: vehicle.type,
                              currentOdometer: vehicle.currentOdometer,
                              fuelType: vehicle.fuelType || '',
                              color: vehicle.color || '',
                            });
                            setShowEditModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            console.log('View button clicked for vehicle:', vehicle);
                            setSelectedVehicle(vehicle);
                            setShowViewModal(true);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🚗</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
                <p className="text-gray-500 mb-6">Start by adding your first vehicle to the fleet.</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add First Vehicle
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assign Vehicle Modal */}
        {showAssignModal && selectedVehicle && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedVehicle.assignedDriverId ? 'Reassign' : 'Assign'} Vehicle
                </h3>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedVehicle(null);
                    setSelectedDriverIds([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Vehicle: {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.licensePlate})
                </p>
                
                {selectedVehicle.assignedDriverIds && selectedVehicle.assignedDriverIds.length > 0 && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-900">
                      Currently assigned to: <strong>
                        {selectedVehicle.assignedDriverIds.map(driver => 
                          typeof driver === 'object' ? driver.name : 'Driver'
                        ).join(', ')}
                      </strong>
                    </p>
                  </div>
                )}
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Drivers (Multiple Selection Allowed)
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {drivers.map((driver) => (
                    <div key={driver._id} className="flex items-center p-2 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        id={`driver-${driver._id}`}
                        value={driver._id}
                        checked={selectedDriverIds.includes(driver._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDriverIds([...selectedDriverIds, driver._id]);
                          } else {
                            setSelectedDriverIds(selectedDriverIds.filter(id => id !== driver._id));
                          }
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`driver-${driver._id}`} className="ml-2 flex-1 cursor-pointer">
                        <span className="font-medium">{driver.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{driver.email}</span>
                      </label>
                    </div>
                  ))}
                </div>
                {selectedDriverIds.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedDriverIds.length} driver(s) selected
                  </p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedVehicle(null);
                    setSelectedDriverIds([]);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignVehicle} 
                  disabled={updating || selectedDriverIds.length === 0}
                >
                  {updating ? 'Assigning...' : 'Assign'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Vehicle Modal */}
        {showEditModal && selectedVehicle && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Vehicle</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedVehicle(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Make <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Plate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VIN
                  </label>
                  <input
                    type="text"
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    maxLength={17}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as VehicleType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="CAR">Car</option>
                    <option value="TRUCK">Truck</option>
                    <option value="VAN">Van</option>
                    <option value="MOTORCYCLE">Motorcycle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Odometer (km) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.currentOdometer}
                    onChange={(e) => setFormData({ ...formData, currentOdometer: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Type
                  </label>
                  <input
                    type="text"
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Gasoline, Diesel, Electric"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., White, Black, Silver"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedVehicle(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateVehicle} disabled={updating}>
                  {updating ? 'Updating...' : 'Update Vehicle'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* View Vehicle Modal */}
        {showViewModal && selectedVehicle && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Vehicle Details</h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedVehicle(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Make & Model</label>
                  <p className="text-gray-900">{selectedVehicle.make} {selectedVehicle.model}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Year</label>
                  <p className="text-gray-900">{selectedVehicle.year}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">License Plate</label>
                  <p className="text-gray-900">{selectedVehicle.licensePlate}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">VIN</label>
                  <p className="text-gray-900">{selectedVehicle.vin || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Type</label>
                  <p className="text-gray-900">{selectedVehicle.type}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <Badge variant={getStatusColor(selectedVehicle.status)}>
                    {selectedVehicle.status}
                  </Badge>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Current Odometer</label>
                  <p className="text-gray-900">{selectedVehicle.currentOdometer.toLocaleString()} km</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Fuel Type</label>
                  <p className="text-gray-900">{selectedVehicle.fuelType || 'Not specified'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Color</label>
                  <p className="text-gray-900">{selectedVehicle.color || 'Not specified'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Assigned Driver</label>
                  <p className="text-gray-900">
                    {(() => {
                      // Check populated assignedDriverIds first
                      if (selectedVehicle.assignedDriverIds && selectedVehicle.assignedDriverIds.length > 0) {
                        if (typeof selectedVehicle.assignedDriverIds[0] === 'object') {
                          // Populated with driver objects
                          return selectedVehicle.assignedDriverIds.map(driver => 
                            typeof driver === 'object' && driver.name ? driver.name : 'Unknown'
                          ).join(', ');
                        }
                      }
                      // Fallback to single driver
                      if (selectedVehicle.assignedDriverId) {
                        return typeof selectedVehicle.assignedDriverId === 'object' 
                          ? selectedVehicle.assignedDriverId.name 
                          : 'Unknown';
                      }
                      return 'Not assigned';
                    })()}
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-gray-900">
                    {new Date(selectedVehicle.createdAt).toLocaleDateString()} {new Date(selectedVehicle.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedVehicle(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Create Vehicle Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Vehicle</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Make <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Toyota"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Camry"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Plate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., ABC-123"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VIN
                  </label>
                  <input
                    type="text"
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="17-character VIN"
                    maxLength={17}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as VehicleType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="CAR">Car</option>
                    <option value="TRUCK">Truck</option>
                    <option value="VAN">Van</option>
                    <option value="MOTORCYCLE">Motorcycle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Odometer (km) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.currentOdometer}
                    onChange={(e) => setFormData({ ...formData, currentOdometer: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="0"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Type
                  </label>
                  <input
                    type="text"
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Gasoline, Diesel, Electric"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., White, Black, Silver"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateVehicle} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Vehicle'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}