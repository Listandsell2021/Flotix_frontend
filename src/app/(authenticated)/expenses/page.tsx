"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { expensesApi, vehiclesApi, usersApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Toast from "@/components/ui/Toast";
import DatePicker from "@/components/ui/DatePicker";
import { useToast } from "@/hooks/useToast";
import { TableSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import type { Expense, User, Vehicle } from "@/types";
import {
  ExpenseStats,
  ExpenseFilters,
  ExpenseTable,
  ExpenseDetailsModal,
  ExpenseEditModal,
  AddExpenseModal
} from "@/components/expenses";

// Expense with populated driver info
interface ExpenseWithDriver extends Omit<Expense, "driverId"> {
  driverId: User | string;
}

export default function ExpensesPage() {
  const { t, i18n } = useTranslation("expenses");
  const toast = useToast();
  const [expenses, setExpenses] = useState<ExpenseWithDriver[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseWithDriver[]>(
    []
  );
  const [filteredExpensesPaginationData, setFilteredExpensesPaginationData] =
    useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState<{ start: string; end: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "date" | "amount" | "merchant" | "driver"
  >("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedExpense, setSelectedExpense] =
    useState<ExpenseWithDriver | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState<Vehicle | null>(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [showFullSizeImage, setShowFullSizeImage] = useState(false);
  const [editFormData, setEditFormData] = useState({
    merchant: "",
    amountFinal: 0,
    currency: "",
    type: "",
    category: "",
    notes: "",
    kilometers: 0,
    odometerReading: 0,
    date: "",
  });
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<User | null>(null);
  const [selectedDriverVehicle, setSelectedDriverVehicle] =
    useState<Vehicle | null>(null);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [addFormData, setAddFormData] = useState({
    driverId: "",
    merchant: "",
    amountFinal: 0,
    currency: "EUR",
    type: "MISC",
    category: "",
    notes: "",
    odometerReading: 0,
    date: new Date().toISOString().split("T")[0],
    receiptFile: null as File | null,
    receiptUrl: "",
  });
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [creatingExpense, setCreatingExpense] = useState(false);
  const [driverSearchQuery, setDriverSearchQuery] = useState("");
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [exportingData, setExportingData] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  // Filter and sort expenses when any filter or sort option changes
  useEffect(() => {
    filterAndSortExpenses();
  }, [
    expenses,
    searchQuery,
    dateRangeFilter,
    typeFilter,
    sortBy,
    sortOrder,
    itemsPerPage,
    currentPage,
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateRangeFilter, typeFilter]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".relative")) {
        setShowFilterDropdown(false);
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load vehicle info when expense modal opens
  useEffect(() => {
    if (showExpenseModal && selectedExpense?.vehicleId) {
      console.log("Vehicle ID in expense:", {
        vehicleId: selectedExpense.vehicleId,
        type: typeof selectedExpense.vehicleId,
        isObject: typeof selectedExpense.vehicleId === "object",
      });

      // Check if vehicleId is already populated as an object
      if (
        typeof selectedExpense.vehicleId === "object" &&
        selectedExpense.vehicleId !== null
      ) {
        // Vehicle data is already populated from the API
        console.log("Using populated vehicle data:", selectedExpense.vehicleId);
        setVehicleInfo(selectedExpense.vehicleId as any);
        setLoadingVehicle(false);
      } else if (typeof selectedExpense.vehicleId === "string") {
        // Vehicle is just an ID, need to fetch details
        console.log(
          "Fetching vehicle details for ID:",
          selectedExpense.vehicleId
        );
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
        merchant: selectedExpense.merchant || "",
        amountFinal: selectedExpense.amountFinal || 0,
        currency: selectedExpense.currency || "EUR",
        type: selectedExpense.type || "MISC",
        category: selectedExpense.category || "",
        notes: selectedExpense.notes || "",
        kilometers: selectedExpense.kilometers || 0,
        odometerReading: selectedExpense.odometerReading || 0,
        date: new Date(selectedExpense.date).toISOString().split("T")[0],
      });
    }
  }, [isEditMode, selectedExpense]);

  // --- Local filterAndSortExpenses logic commented out ---
  /*
  const filterAndSortExpenses = () => {
    // ...local filtering and sorting logic...
  };
  */

  // --- API-based filtering and sorting ---
  const filterAndSortExpenses = async () => {
    // Build query params from current filter/sort state
    const params: any = {};
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (typeFilter) params.type = typeFilter;
    if (dateRangeFilter?.start) params.dateFrom = dateRangeFilter.start;
    if (dateRangeFilter?.end) params.dateTo = dateRangeFilter.end;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    // Add pagination if needed
    params.page = currentPage;
    params.limit = itemsPerPage;

    try {
      const response = await expensesApi.getExpenses(params);
      if (response.success && response.data) {
        setFilteredExpenses(response.data.data || []);
        setFilteredExpensesPaginationData(response.data.pagination);
        setStats(response.stats || null);
      } else {
        setFilteredExpenses([]);
      }
    } catch (err) {
      setFilteredExpenses([]);
    }
  };

  const loadExpenses = async () => {
    try {
      const response = await expensesApi.getExpenses();
      if (response.success && response.data) {
        // API returns paginated response: { data: Expense[], pagination: {...} }
        setExpenses(response.data.data || []);
        setFilteredExpensesPaginationData(response.data.pagination);
        setStats(response.stats || null);
      } else {
        setError(response.message || t("modal.failedToLoadExpenses"));
      }
    } catch (err: any) {
      setError(err.message || t("modal.failedToLoadExpenses"));
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
      console.error("Failed to load vehicle info:", err);
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
        date: editFormData.date,
      };

      // Only include category if it has a valid enum value
      if (
        editFormData.category &&
        ["TOLL", "PARKING", "REPAIR", "OTHER"].includes(editFormData.category)
      ) {
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

      // Only include odometerReading if it has a value
      if (editFormData.odometerReading && editFormData.odometerReading > 0) {
        updateData.odometerReading = editFormData.odometerReading;
      }

      console.log("Updating expense with data:", updateData);

      const response = await expensesApi.updateExpense(
        selectedExpense._id,
        updateData
      );

      if (response.success) {
        // Refresh expenses list
        await loadExpenses();
        // Exit edit mode and close modal
        setIsEditMode(false);
        setShowExpenseModal(false);
        setSelectedExpense(null);
      } else {
        console.error("Update failed:", response);
        toast.error(response.message || t("errors.updateFailed"));
      }
    } catch (err: any) {
      console.error("Update error:", err);
      if (err.response?.data?.message) {
        toast.error(`${t("errors.exportFailedPrefix")} ${err.response.data.message}`);
      } else {
        toast.error(err.message || t("errors.updateFailed"));
      }
    }
  };

  const loadDrivers = async (searchQuery = ""): Promise<User[]> => {
    setLoadingDrivers(true);
    try {
      console.log("Loading drivers with search:", searchQuery);

      // Get users (API already filters to DRIVER role for Admin users)
      const response = await usersApi.getUsersByRole({
        search: searchQuery,
        role: "DRIVER",
      });
      console.log("Raw API response:", response);

      // Extract users from nested response structure
      let allUsers = [];
      if (
        response?.success &&
        response?.data?.data &&
        Array.isArray(response.data.data)
      ) {
        allUsers = response.data.data;
      }

      console.log("Drivers found:", allUsers.length);
      console.log("Sample driver:", allUsers[0]);

      // Filter by search query if provided (additional client-side filtering)
      let filteredDrivers = allUsers;
      if (searchQuery) {
        filteredDrivers = allUsers.filter((user: any) => {
          const matchesSearch =
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesSearch;
        });
      }

      console.log("Drivers after filtering:", filteredDrivers.length);
      console.log("Driver examples:", filteredDrivers.slice(0, 2));

      setDrivers(filteredDrivers);
      return filteredDrivers;
    } catch (err: any) {
      console.error("Failed to load drivers:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
      });
      setDrivers([]);
      return [];
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleDriverSelection = async (driverId: string) => {
    const driver = drivers.find((d) => d._id === driverId);
    setSelectedDriver(driver || null);
    setAddFormData({ ...addFormData, driverId });

    // Load driver's vehicle if assigned
    if (driver?.assignedVehicleId) {
      // Check if assignedVehicleId is already populated (object) or just an ID (string)
      if (
        typeof driver.assignedVehicleId === "object" &&
        driver.assignedVehicleId !== null
      ) {
        // Vehicle data is already populated
        const vehicleData = driver.assignedVehicleId as any;
        console.log("Vehicle data from populated field:", vehicleData);
        setSelectedDriverVehicle(vehicleData);
      } else {
        // assignedVehicleId is just an ID string, fetch the vehicle data
        try {
          const vehicleId =
            typeof driver.assignedVehicleId === "string"
              ? driver.assignedVehicleId
              : (driver.assignedVehicleId as any)._id;

          const response = await vehiclesApi.getVehicle(vehicleId);
          if (response.success && response.data) {
            console.log("Vehicle data from API:", response.data);
            setSelectedDriverVehicle(response.data);
          }
        } catch (err: any) {
          console.error("Failed to load driver vehicle:", err);
          setSelectedDriverVehicle(null);
        }
      }
    } else {
      setSelectedDriverVehicle(null);
    }
  };

  const createExpense = async (formData?: any) => {
    if (creatingExpense) return;
    setCreatingExpense(true);

    // Use provided formData or fall back to addFormData state
    const data = formData || addFormData;

    try {
      let receiptUrl = "";

      // Upload receipt if provided
      if (data.receiptFile) {
        const uploadResponse = await expensesApi.uploadReceipt(
          data.receiptFile
        );
        if (uploadResponse.success && uploadResponse.data) {
          receiptUrl = uploadResponse.data.receiptUrl;
        }
      }

      const expenseData = {
        driverId: data.driverId,
        merchant: data.merchant,
        amountFinal: data.amountFinal,
        currency: data.currency,
        type: data.type,
        receiptUrl: receiptUrl || data.receiptUrl || "",
        date: data.date,
      };

      // Only include optional fields if they have values
      if (
        data.category &&
        ["TOLL", "PARKING", "REPAIR", "OTHER"].includes(data.category)
      ) {
        (expenseData as any).category = data.category;
      }

      if (data.notes && data.notes.trim()) {
        (expenseData as any).notes = data.notes.trim();
      }

      if (data.odometerReading && data.odometerReading > 0) {
        (expenseData as any).odometerReading = data.odometerReading;
      }

      const response = await expensesApi.createExpense(expenseData);

      if (response.success) {
        // Show success toast
        toast.success(t("errors.expenseCreatedSuccess"));
        // Refresh expenses list
        await loadExpenses();
        // Close modal and reset form
        setShowAddExpenseModal(false);
        resetAddForm();
      } else {
        toast.error(response.message || t("errors.createFailed"));
      }
    } catch (err: any) {
      console.error("Create expense error:", err);
      if (err.response?.data?.message) {
        toast.error(`${t("errors.exportFailedPrefix")} ${err.response.data.message}`);
      } else {
        toast.error(err.message || t("errors.createFailed"));
      }
    } finally {
      setCreatingExpense(false);
    }
  };

  const resetAddForm = () => {
    setAddFormData({
      driverId: "",
      merchant: "",
      amountFinal: 0,
      currency: "EUR",
      type: "MISC",
      category: "",
      notes: "",
      odometerReading: 0,
      date: new Date().toISOString().split("T")[0],
      receiptFile: null,
      receiptUrl: "",
    });
    setSelectedDriver(null);
    setSelectedDriverVehicle(null);
    setDriverSearchQuery("");
    setOcrResult(null);
    setOcrProcessing(false);
  };

  const handleReceiptUpload = async (file: File): Promise<{ ocrData: any; receiptUrl: string }> => {
    if (!file) return { ocrData: null, receiptUrl: '' };

    setOcrProcessing(true);
    setOcrResult(null);

    try {
      console.log("Starting OCR processing for file:", file.name);

      // Upload and process with OCR
      const response = await expensesApi.uploadReceipt(file);
      console.log("OCR Response:", response);

      if (response.success && response.data) {
        const { receiptUrl, ocrResult } = response.data;

        setOcrResult(ocrResult);
        setAddFormData((prev) => ({
          ...prev,
          receiptFile: file,
          receiptUrl: receiptUrl,
          // Pre-fill form fields from OCR results
          merchant: ocrResult.merchant || prev.merchant,
          amountFinal: ocrResult.amount || prev.amountFinal,
          currency: ocrResult.currency || prev.currency,
          date: ocrResult.date || prev.date,
        }));

        console.log("OCR data extracted and form pre-filled");
        return { ocrData: ocrResult, receiptUrl };
      } else {
        console.warn("OCR processing failed:", response.message);
        setAddFormData((prev) => ({ ...prev, receiptFile: file }));
        return { ocrData: null, receiptUrl: '' };
      }
    } catch (error) {
      console.error("OCR processing error:", error);
      setAddFormData((prev) => ({ ...prev, receiptFile: file }));
      return { ocrData: null, receiptUrl: '' };
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

      if (dateRangeFilter?.start) {
        exportFilters.dateFrom = dateRangeFilter.start;
      }

      if (dateRangeFilter?.end) {
        exportFilters.dateTo = dateRangeFilter.end;
      }

      if (typeFilter) {
        exportFilters.type = typeFilter;
      }

      console.log("Exporting expenses with filters:", exportFilters);

      const response = await expensesApi.exportExpenses(exportFilters);

      // Create download link
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      let filename = `expenses_export_${dateStr}`;

      if (dateRangeFilter?.start && dateRangeFilter?.end) {
        filename += `_${dateRangeFilter.start}_to_${dateRangeFilter.end}`;
      } else if (dateRangeFilter?.start) {
        filename += `_from_${dateRangeFilter.start}`;
      } else if (dateRangeFilter?.end) {
        filename += `_until_${dateRangeFilter.end}`;
      }

      if (typeFilter) {
        filename += `_${typeFilter.toLowerCase()}`;
      }

      filename += ".csv";
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Export completed successfully");
    } catch (err: any) {
      console.error("Export failed:", err);
      if (err.response?.data?.message) {
        alert(`Export failed: ${err.response.data.message}`);
      } else {
        toast.error(err.message || t("errors.exportFailed"));
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
          {[1, 2, 3, 4].map((i) => (
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
              {t("modal.errorLoadingExpenses")}
            </h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "FUEL":
        return "bg-blue-100 text-blue-800";
      case "MISC":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (type: string, category?: string) => {
    if (type === "FUEL") {
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  };

  // const totalAmount = filteredExpenses.reduce((sum, expense) => sum + (expense.amountFinal || 0), 0);
  // const fuelExpenses = filteredExpenses.filter(e => e.type === 'FUEL');
  // const miscExpenses = filteredExpenses.filter(e => e.type === 'MISC');

  // Pagination calculations
  const totalPages = filteredExpensesPaginationData?.pages || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  // const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of expenses list
    document
      .getElementById("expenses-list")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-600 mt-2">{t("subtitle")}</p>
        </div>
        <button
          onClick={() => {
            setShowAddExpenseModal(true);
            loadDrivers("");
          }}
          className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-sm hover:shadow flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('addExpense')}
        </button>
      </div>

      {/* Stats Cards */}
      <ExpenseStats
        stats={stats ? {
          totalExpenses: stats.totalExpenses || 0,
          totalAmount: stats.totalAmount || 0,
          fuelExpenses: stats.byType?.FUEL?.amount || 0,
          miscExpenses: stats.byType?.MISC?.amount || 0,
        } : null}
        loading={loading}
      />

      {/* Filters Component */}
      <ExpenseFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        dateRangeFilter={dateRangeFilter}
        onDateRangeChange={setDateRangeFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onExport={handleExportExpenses}
        isExporting={exportingData}
      />

      {/* Expenses List */}
      <ExpenseTable
        expenses={filteredExpenses}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredExpensesPaginationData?.total || 0}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        onViewExpense={(expense) => {
          setSelectedExpense(expense);
          setShowExpenseModal(true);
          setIsEditMode(false);
        }}
        onEditExpense={(expense) => {
          setSelectedExpense(expense);
          setIsEditMode(true);
          setShowExpenseModal(true);
        }}
        loading={loading}
      />


      {/* Expense Details Modal */}
      {showExpenseModal && selectedExpense && !isEditMode && (
        <ExpenseDetailsModal
          expense={selectedExpense}
          vehicle={vehicleInfo}
          loadingVehicle={loadingVehicle}
          onClose={() => {
            setShowExpenseModal(false);
            setSelectedExpense(null);
            setVehicleInfo(null);
          }}
          onEdit={() => setIsEditMode(true)}
        />
      )}

      {/* Expense Edit Modal */}
      {showExpenseModal && selectedExpense && isEditMode && (
        <ExpenseEditModal
          expense={selectedExpense}
          onClose={() => {
            setShowExpenseModal(false);
            setSelectedExpense(null);
            setIsEditMode(false);
          }}
          onSave={async (data) => {
            try {
              await expensesApi.updateExpense(selectedExpense._id, data);
              toast.success(t("errors.updateSuccess") || "Expense updated successfully");
              await loadExpenses();
              setShowExpenseModal(false);
              setSelectedExpense(null);
              setIsEditMode(false);
            } catch (error: any) {
              toast.error(error.response?.data?.message || t("errors.updateFailed"));
            }
          }}
        />
      )}


      {/* Full Size Image Modal */}
      {showFullSizeImage && selectedExpense?.receiptUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFullSizeImage(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowFullSizeImage(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-colors z-10"
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
            <img
              src={selectedExpense.receiptUrl}
              alt={t("modal.receiptFullSizeAlt")}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <AddExpenseModal
          onClose={() => {
            setShowAddExpenseModal(false);
            resetAddForm();
          }}
          onSubmit={async (data) => {
            await createExpense(data);
          }}
          onLoadDrivers={loadDrivers}
          onLoadDriverVehicle={async (driverId) => {
            try {
              const response = await vehiclesApi.getVehicleByDriver(driverId);
              // Response structure: { success: true, data: { user with assignedVehicleId populated } }
              const user = response.data;
              return user?.assignedVehicleId || null;
            } catch (error) {
              console.error('Error loading vehicle:', error);
              return null;
            }
          }}
          onReceiptUpload={handleReceiptUpload}
          isCreating={creatingExpense}
        />
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
