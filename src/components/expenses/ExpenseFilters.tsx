"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/Button";
import DatePicker, { DatePickerHandleRef } from "@/components/ui/DatePicker";

interface ExpenseFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  dateRangeFilter: { start: string; end: string } | null;
  onDateRangeChange: (range: { start: string; end: string } | null) => void;
  sortBy: "date" | "amount" | "merchant" | "driver";
  onSortByChange: (sortBy: "date" | "amount" | "merchant" | "driver") => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (order: "asc" | "desc") => void;
  onExport: () => void;
  isExporting?: boolean;
}

export default function ExpenseFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  dateRangeFilter,
  onDateRangeChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onExport,
  isExporting = false,
}: ExpenseFiltersProps) {
  const { t } = useTranslation("expenses");
  const datePickerRef = useRef<DatePickerHandleRef | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClearFilters = () => {
    onSearchChange("");
    onTypeFilterChange("");
    onDateRangeChange(null);
    if (datePickerRef.current) {
      datePickerRef.current.datePickerClearFunction();
    }
  };

  const hasActiveFilters = searchQuery || typeFilter || dateRangeFilter;

  return (
    <div className="mb-6">
      {/* Main Filter Card */}
      <div className="relative overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-50 via-blue-50 to-transparent opacity-30 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>

        <div className="relative p-5">
          {/* Single Row: Search (70%) + Date Range (30%) + Clear Button */}
          <div className="flex gap-3 items-center">
            {/* Professional Search Bar - 70% */}
            <div className="relative flex-[7]">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder={t("filters.search")}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-[4.5rem] pr-4 py-4 text-base font-medium bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-gray-400 hover:border-gray-300 shadow-sm hover:shadow"
                />
              </div>
            </div>

            {/* Date Range Picker - 30% */}
            <div className="relative flex-[3]">
              <DatePicker
                ref={datePickerRef}
                mode="range"
                value={dateRangeFilter}
                onChange={(value) => {
                  if (value && typeof value === "object") {
                    onDateRangeChange(value);
                  } else {
                    onDateRangeChange(null);
                  }
                }}
                placeholder={t("filters.dateRange")}
                className="text-sm"
              />
            </div>

            {/* Clear Filters Button - Only shows when filters are active */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 text-red-600 hover:from-red-100 hover:to-red-200 hover:border-red-300 transition-all shadow-sm hover:shadow group"
                title="Clear all filters"
              >
                <svg
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
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
            )}
          </div>

          {/* Active Filters Display with Enhanced Pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
              {searchQuery && (
                <div className="group relative inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200 shadow-sm hover:shadow transition-all">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span className="font-semibold">"{searchQuery}"</span>
                  <button
                    onClick={() => onSearchChange("")}
                    className="ml-1 p-0.5 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}
              {typeFilter && (
                <div className="group relative inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 via-purple-100 to-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200 shadow-sm hover:shadow transition-all">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span className="font-semibold">
                    {t(`types.${typeFilter}`)}
                  </span>
                  <button
                    onClick={() => onTypeFilterChange("")}
                    className="ml-1 p-0.5 rounded-full hover:bg-purple-200 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}
              {dateRangeFilter && (
                <div className="group relative inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200 shadow-sm hover:shadow transition-all">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-semibold">
                    {dateRangeFilter.start} - {dateRangeFilter.end}
                  </span>
                  <button
                    onClick={() => onDateRangeChange(null)}
                    className="ml-1 p-0.5 rounded-full hover:bg-emerald-200 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
