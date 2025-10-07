"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { vehiclesApi, usersApi } from "@/lib/api";
import type {
  Vehicle,
  User,
  CreateVehicleRequest,
  VehicleType,
} from "@/types";

// Extended type for vehicle with populated driver(s)
interface VehicleWithDriver
  extends Omit<Vehicle, "assignedDriverId" | "assignedDriverIds"> {
  assignedDriverId?:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
  assignedDriverIds?: (
    | string
    | {
        _id: string;
        name: string;
        email: string;
      }
  )[];
}

export default function VehiclesPage() {
  const { t } = useTranslation(["vehicles", "common"]);
  const toast = useToast();

  // Helper function to translate status
  const getTranslatedStatus = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return t('vehicles:status.active');
      case 'INACTIVE':
        return t('vehicles:status.inactive');
      case 'MAINTENANCE':
        return t('vehicles:status.maintenance');
      default:
        return status;
    }
  };
  const [vehicles, setVehicles] = useState<VehicleWithDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleWithDriver | null>(null);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState<CreateVehicleRequest>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    licensePlate: "",
    vin: "",
    type: "CAR" as VehicleType,
    currentOdometer: 0,
    fuelType: "",
    color: "",
  });

  useEffect(() => {
    loadVehicles();
    loadDrivers();
  }, []);

  const loadVehicles = async () => {
    try {
      const response = await vehiclesApi.getVehicles();
      if (response.success && response.data) {
        console.log("Vehicles loaded:", response.data.data);
        // Check what driver data we have
        response.data.data?.forEach((v: any) => {
          if (v.assignedDriverId || v.assignedDriverIds) {
            console.log(`Vehicle ${v.licensePlate}:`, {
              assignedDriverId: v.assignedDriverId,
              assignedDriverIds: v.assignedDriverIds,
            });
          }
        });
        setVehicles(response.data.data || []);
      } else {
        setError(t("errors.failedToLoadVehicles"));
      }
    } catch (err: any) {
      setError(err.message || t("errors.failedToLoadVehicles"));
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      const response = await usersApi.getUsers({ role: "DRIVER" });
      if (response.success && response.data) {
        setDrivers(response.data.data || []);
      }
    } catch (err: any) {
      console.error("Failed to load drivers:", err);
    }
  };

  const handleAssignVehicle = async () => {
    if (!selectedVehicle || selectedDriverIds.length === 0) {
      toast.warning(t("common:alerts.pleaseSelectDriver"));
      return;
    }

    setUpdating(true);
    try {
      const response = await vehiclesApi.assignVehicle(
        selectedVehicle._id,
        selectedDriverIds
      );
      if (response.success) {
        await loadVehicles();
        setShowAssignModal(false);
        setSelectedVehicle(null);
        setSelectedDriverIds([]);
        toast.success(t("common:alerts.vehicleAssignedSuccess"));
      } else {
        toast.error(response.message || t("common:alerts.failedToAssignVehicle"));
      }
    } catch (err: any) {
      toast.error(err.message || t("common:alerts.failedToAssignVehicle"));
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
        toast.success(t("common:alerts.vehicleUpdatedSuccess"));
      } else {
        toast.error(response.message || t("common:alerts.failedToUpdateVehicle"));
      }
    } catch (err: any) {
      toast.error(err.message || t("common:alerts.failedToUpdateVehicle"));
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateVehicle = async () => {
    if (!formData.make || !formData.model || !formData.licensePlate || formData.currentOdometer === undefined || formData.currentOdometer === null) {
      toast.warning(t("common:alerts.fillRequiredFields"));
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
          make: "",
          model: "",
          year: new Date().getFullYear(),
          licensePlate: "",
          vin: "",
          type: "CAR" as VehicleType,
          currentOdometer: 0,
          fuelType: "",
          color: "",
        });
        toast.success(t("common:alerts.vehicleCreatedSuccess"));
      } else {
        toast.error(response.message || t("common:alerts.failedToCreateVehicle"));
      }
    } catch (err: any) {
      toast.error(err.message || t("common:alerts.failedToCreateVehicle"));
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "MAINTENANCE":
        return "warning";
      case "RETIRED":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "CAR":
        return "🚗";
      case "TRUCK":
        return "🚛";
      case "VAN":
        return "🚐";
      case "MOTORCYCLE":
        return "🏍️";
      default:
        return "🚗";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg
            className="w-6 h-6 text-red-600 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Error Loading Vehicles
            </h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const activeVehicles = vehicles.filter((v) => v.status === "ACTIVE");
  const assignedVehicles = vehicles.filter((v) => v.assignedDriverId);
  const totalOdometer = vehicles.reduce(
    (sum, v) => sum + (v.currentOdometer || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-600 mt-2">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {t("addVehicle")}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  {t("stats.totalVehicles")}
                </p>
                <div className="flex items-baseline mt-3 space-x-2">
                  <p className="text-4xl font-bold text-gray-900">
                    {vehicles.length}
                  </p>
                  <p className="text-sm text-gray-500">{t("vehiclesText")}</p>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center shadow-sm">
                <span className="text-3xl">🚗</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  {t("stats.activeVehicles")}
                </p>
                <div className="flex items-baseline mt-3 space-x-2">
                  <p className="text-4xl font-bold text-green-600">
                    {activeVehicles.length}
                  </p>
                  <p className="text-sm text-gray-500">{t("stats.operational")}</p>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-sm">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  {t("stats.assigned")}
                </p>
                <div className="flex items-baseline mt-3 space-x-2">
                  <p className="text-4xl font-bold text-blue-600">
                    {assignedVehicles.length}
                  </p>
                  <p className="text-sm text-gray-500">{t("stats.toDrivers")}</p>
                </div>
                <div className="mt-3 flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          vehicles.length > 0
                            ? (assignedVehicles.length / vehicles.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="ml-3 text-xs font-medium text-gray-600">
                    {vehicles.length - assignedVehicles.length} {t("available")}
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-sm">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
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
            <span>
              {t("table.allVehicles")} ({vehicles.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vehicles.length > 0 ? (
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
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
                        {(vehicle.assignedDriverId ||
                          (vehicle.assignedDriverIds &&
                            vehicle.assignedDriverIds.length > 0)) &&
                          " • Assigned"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Badge variant={getStatusColor(vehicle.status)}>
                        {getTranslatedStatus(vehicle.status)}
                      </Badge>
                      {(() => {
                        // Check if we have populated assignedDriverIds
                        if (
                          vehicle.assignedDriverIds &&
                          vehicle.assignedDriverIds.length > 0 &&
                          typeof vehicle.assignedDriverIds[0] === "object"
                        ) {
                          const driverNames = vehicle.assignedDriverIds
                            .map((driver) =>
                              typeof driver === "object"
                                ? driver.name
                                : t("table.unknown")
                            )
                            .join(", ");
                          return (
                            <p className="text-sm text-gray-600 mt-1">
                              {vehicle.assignedDriverIds.length > 1
                                ? t("table.drivers")
                                : t("table.driver")}
                              : {driverNames}
                            </p>
                          );
                        } else if (vehicle.assignedDriverId) {
                          // Fallback to single driver
                          return (
                            <p className="text-sm text-gray-600 mt-1">
                              Driver:{" "}
                              {typeof vehicle.assignedDriverId === "object"
                                ? vehicle.assignedDriverId.name
                                : t("table.unknown")}
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
                          const driverIds =
                            vehicle.assignedDriverIds
                              ?.map((driver) =>
                                typeof driver === "object" ? driver._id : driver
                              )
                              .filter((id) => id) || [];
                          setSelectedDriverIds(driverIds);
                          setShowAssignModal(true);
                        }}
                      >
                        {vehicle.assignedDriverId ? t("table.reassign") : t("table.assign")}
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
                            vin: vehicle.vin || "",
                            type: vehicle.type,
                            currentOdometer: vehicle.currentOdometer,
                            fuelType: vehicle.fuelType || "",
                            color: vehicle.color || "",
                          });
                          setShowEditModal(true);
                        }}
                      >
                        {t("actions.edit")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log(
                            "View button clicked for vehicle:",
                            vehicle
                          );
                          setSelectedVehicle(vehicle);
                          setShowViewModal(true);
                        }}
                      >
                        {t("actions.view")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🚗</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("noVehiclesFound")}
              </h3>
              <p className="text-gray-500 mb-6">
                {t("noVehiclesMessage")}
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {t("addFirstVehicle")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Vehicle Modal */}
      {showAssignModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center z-50 p-4 pt-20">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedVehicle.assignedDriverId ? t("table.reassign") : t("table.assign")}{" "}
                {t("modal.vehicle")}
              </h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedVehicle(null);
                  setSelectedDriverIds([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                {t("modal.vehicle")}: {selectedVehicle.make} {selectedVehicle.model} (
                {selectedVehicle.licensePlate})
              </p>

              {selectedVehicle.assignedDriverIds &&
                selectedVehicle.assignedDriverIds.length > 0 && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-900">
                      {t("modal.currentlyAssignedTo")}:{" "}
                      <strong>
                        {selectedVehicle.assignedDriverIds
                          .map((driver) =>
                            typeof driver === "object" ? driver.name : t("table.driver")
                          )
                          .join(", ")}
                      </strong>
                    </p>
                  </div>
                )}

              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("modal.selectDrivers")}
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
                {drivers.map((driver) => (
                  <div
                    key={driver._id}
                    className="flex items-center p-2 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      id={`driver-${driver._id}`}
                      value={driver._id}
                      checked={selectedDriverIds.includes(driver._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDriverIds([
                            ...selectedDriverIds,
                            driver._id,
                          ]);
                        } else {
                          setSelectedDriverIds(
                            selectedDriverIds.filter((id) => id !== driver._id)
                          );
                        }
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`driver-${driver._id}`}
                      className="ml-2 flex-1 cursor-pointer"
                    >
                      <span className="font-medium">{driver.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {driver.email}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              {selectedDriverIds.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {selectedDriverIds.length} {t("modal.driversSelected")}
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
                {t("actions.cancel")}
              </Button>
              <Button
                onClick={handleAssignVehicle}
                disabled={updating || selectedDriverIds.length === 0}
              >
                {updating ? t("modal.assigning") : t("modal.assign")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center z-50 p-4 pt-20">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("modal.editVehicle")}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedVehicle(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.make")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) =>
                    setFormData({ ...formData, make: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.model")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.year")} <span className="text-gray-500 text-xs">{t("common:form.optional")}</span>
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year:
                        parseInt(e.target.value) || new Date().getFullYear(),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.licensePlate")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      licensePlate: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.vin")} <span className="text-gray-500 text-xs">{t("common:form.optional")}</span>
                </label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vin: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  maxLength={17}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.type")} <span className="text-gray-500 text-xs">{t("common:form.optional")}</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as VehicleType,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="CAR">{t("vehicleTypes.CAR")}</option>
                  <option value="TRUCK">{t("vehicleTypes.TRUCK")}</option>
                  <option value="VAN">{t("vehicleTypes.VAN")}</option>
                  <option value="MOTORCYCLE">{t("vehicleTypes.MOTORCYCLE")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.currentOdometerLabel")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.currentOdometer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentOdometer: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.fuelType")} <span className="text-gray-500 text-xs">{t("common:form.optional")}</span>
                </label>
                <input
                  type="text"
                  value={formData.fuelType}
                  onChange={(e) =>
                    setFormData({ ...formData, fuelType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t("form.fuelTypePlaceholder")}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.color")} <span className="text-gray-500 text-xs">{t("common:form.optional")}</span>
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t("form.colorPlaceholder")}
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
                {t("actions.cancel")}
              </Button>
              <Button onClick={handleUpdateVehicle} disabled={updating}>
                {updating ? t("modal.updating") : t("modal.updateVehicle")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Vehicle Modal */}
      {showViewModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center z-50 p-4 pt-20">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("modal.vehicleDetails")}
              </h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedVehicle(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {t("modal.makeModel")}
                </label>
                <p className="text-gray-900">
                  {selectedVehicle.make} {selectedVehicle.model}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {t("form.year")}
                </label>
                <p className="text-gray-900">{selectedVehicle.year}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {t("form.licensePlate")}
                </label>
                <p className="text-gray-900">{selectedVehicle.licensePlate}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {t("form.vin")}
                </label>
                <p className="text-gray-900">
                  {selectedVehicle.vin || t("table.notProvided")}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {t("form.type")}
                </label>
                <p className="text-gray-900">{selectedVehicle.type}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {t("table.status")}
                </label>
                <Badge variant={getStatusColor(selectedVehicle.status)}>
                  {selectedVehicle.status}
                </Badge>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {t("form.currentOdometer")}
                </label>
                <p className="text-gray-900">
                  {selectedVehicle.currentOdometer.toLocaleString()} km
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {t("form.fuelType")}
                </label>
                <p className="text-gray-900">
                  {selectedVehicle.fuelType || t("table.notSpecified")}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {t("form.color")}
                </label>
                <p className="text-gray-900">
                  {selectedVehicle.color || t("table.notSpecified")}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  {t("modal.assignedDriver")}
                </label>
                <p className="text-gray-900">
                  {(() => {
                    // Check populated assignedDriverIds first
                    if (
                      selectedVehicle.assignedDriverIds &&
                      selectedVehicle.assignedDriverIds.length > 0
                    ) {
                      if (
                        typeof selectedVehicle.assignedDriverIds[0] === "object"
                      ) {
                        // Populated with driver objects
                        return selectedVehicle.assignedDriverIds
                          .map((driver) =>
                            typeof driver === "object" && driver.name
                              ? driver.name
                              : t("table.unknown")
                          )
                          .join(", ");
                      }
                    }
                    // Fallback to single driver
                    if (selectedVehicle.assignedDriverId) {
                      return typeof selectedVehicle.assignedDriverId ===
                        "object"
                        ? selectedVehicle.assignedDriverId.name
                        : t("table.unknown");
                    }
                    return t("table.notAssigned");
                  })()}
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">
                  {t("modal.createdAt")}
                </label>
                <p className="text-gray-900">
                  {new Date(selectedVehicle.createdAt).toLocaleDateString()}{" "}
                  {new Date(selectedVehicle.createdAt).toLocaleTimeString()}
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
                {t("actions.close")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Vehicle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center z-50 p-4 pt-20">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("modal.addNewVehicle")}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.make")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) =>
                    setFormData({ ...formData, make: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t("form.makePlaceholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.model")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t("form.modelPlaceholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.year")} <span className="text-gray-500 text-xs">{t("common:form.optional")}</span>
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year:
                        parseInt(e.target.value) || new Date().getFullYear(),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.licensePlate")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      licensePlate: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t("form.licensePlatePlaceholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.vin")} <span className="text-gray-500 text-xs">{t("common:form.optional")}</span>
                </label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vin: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t("form.vinPlaceholder")}
                  maxLength={17}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.type")} <span className="text-gray-500 text-xs">{t("common:form.optional")}</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as VehicleType,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="CAR">{t("vehicleTypes.CAR")}</option>
                  <option value="TRUCK">{t("vehicleTypes.TRUCK")}</option>
                  <option value="VAN">{t("vehicleTypes.VAN")}</option>
                  <option value="MOTORCYCLE">{t("vehicleTypes.MOTORCYCLE")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.currentOdometerLabel")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.currentOdometer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentOdometer: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                  placeholder={t("form.odometerPlaceholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.fuelType")} <span className="text-gray-500 text-xs">{t("common:form.optional")}</span>
                </label>
                <input
                  type="text"
                  value={formData.fuelType}
                  onChange={(e) =>
                    setFormData({ ...formData, fuelType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t("form.fuelTypePlaceholder")}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.color")} <span className="text-gray-500 text-xs">{t("common:form.optional")}</span>
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t("form.colorPlaceholder")}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                {t("actions.cancel")}
              </Button>
              <Button onClick={handleCreateVehicle} disabled={creating}>
                {creating ? t("modal.creating") : t("modal.createVehicle")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast.toasts.map((toastItem) => (
        <Toast
          key={toastItem.id}
          message={toastItem.message}
          type={toastItem.type}
          duration={toastItem.duration}
          onClose={() => toast.removeToast(toastItem.id)}
        />
      ))}
    </div>
  );
}
