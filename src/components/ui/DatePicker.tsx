"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { createPortal } from "react-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  parseISO,
  isValid,
} from "date-fns";
import { de, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

interface DatePickerProps {
  mode?: "single" | "range";
  value?: string | { start: string; end: string } | null;
  onChange: (value: string | { start: string; end: string } | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  label?: string | React.ReactNode;
  required?: boolean;
}
export interface DatePickerHandleRef {
  datePickerClearFunction: () => void;
}
const DatePicker = forwardRef<DatePickerHandleRef, DatePickerProps>(
  (
    {
      mode = "single",
      value,
      onChange,
      placeholder,
      className = "",
      disabled = false,
      minDate,
      maxDate,
      label,
      required = false,
    },
    ref
  ) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [rangeStart, setRangeStart] = useState<Date | null>(null);
    const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState({
      top: 0,
      left: 0,
      width: 0,
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    // Get locale based on current language
    const locale = i18n.language === "de" ? de : enUS;

    // Set mounted state
    useEffect(() => {
      setMounted(true);
    }, []);

    // Expose a function to the parent via the ref
    useImperativeHandle(ref, () => ({
      datePickerClearFunction: handleClear,
    }));

    // Initialize from value prop
    useEffect(() => {
      if (mode === "single" && value && typeof value === "string") {
        const date = parseISO(value);
        if (isValid(date)) {
          setSelectedDate(date);
          setCurrentMonth(date);
        }
      } else if (mode === "range" && value && typeof value === "object") {
        if (value.start) {
          const start = parseISO(value.start);
          if (isValid(start)) {
            setRangeStart(start);
            setCurrentMonth(start);
          }
        }
        if (value.end) {
          const end = parseISO(value.end);
          if (isValid(end)) setRangeEnd(end);
        }
      }
    }, [value, mode]);

    // Update dropdown position when opened
    useEffect(() => {
      if (isOpen && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    const handleDateClick = (date: Date) => {
      if (disabled) return;

      // Check min/max date constraints
      if (minDate && date < minDate) return;
      if (maxDate && date > maxDate) return;

      if (mode === "single") {
        setSelectedDate(date);
        onChange(format(date, "yyyy-MM-dd"));
        setIsOpen(false);
      } else {
        // Range mode
        if (!rangeStart || (rangeStart && rangeEnd)) {
          // Start new range
          setRangeStart(date);
          setRangeEnd(null);
          onChange({ start: format(date, "yyyy-MM-dd"), end: "" });
        } else {
          // Complete range
          if (date < rangeStart) {
            setRangeEnd(rangeStart);
            setRangeStart(date);
            onChange({
              start: format(date, "yyyy-MM-dd"),
              end: format(rangeStart, "yyyy-MM-dd"),
            });
          } else {
            setRangeEnd(date);
            onChange({
              start: format(rangeStart, "yyyy-MM-dd"),
              end: format(date, "yyyy-MM-dd"),
            });
          }
          setIsOpen(false);
        }
      }
    };

    const handleClear = () => {
      if (mode === "single") {
        setSelectedDate(null);
        onChange(null);
      } else {
        setRangeStart(null);
        setRangeEnd(null);
        onChange(null);
      }
    };

    const renderCalendar = () => {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { locale });
      const endDate = endOfWeek(monthEnd, { locale });

      const dateFormat = "EEEEE"; // Single letter day names
      const rows = [];

      // Weekday headers
      const daysHeader = [];
      let day = startDate;
      for (let i = 0; i < 7; i++) {
        daysHeader.push(
          <div
            key={i}
            className="text-center text-xs font-semibold text-gray-600 py-2"
          >
            {format(day, dateFormat, { locale })}
          </div>
        );
        day = addDays(day, 1);
      }

      // Calendar days
      let days = [];
      day = startDate;

      while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
          const formattedDate = format(day, "yyyy-MM-dd");
          const cloneDay = day;

          const isSelected =
            mode === "single"
              ? selectedDate && isSameDay(day, selectedDate)
              : false;

          const isRangeStart =
            mode === "range" && rangeStart && isSameDay(day, rangeStart);
          const isRangeEnd =
            mode === "range" && rangeEnd && isSameDay(day, rangeEnd);
          const isInRange =
            mode === "range" &&
            rangeStart &&
            rangeEnd &&
            isWithinInterval(day, { start: rangeStart, end: rangeEnd });
          const isInHoverRange =
            mode === "range" &&
            rangeStart &&
            !rangeEnd &&
            hoverDate &&
            ((day >= rangeStart && day <= hoverDate) ||
              (day <= rangeStart && day >= hoverDate));

          const isDisabled =
            !isSameMonth(day, monthStart) ||
            (minDate && day < minDate) ||
            (maxDate && day > maxDate);

          days.push(
            <button
              key={formattedDate}
              type="button"
              className={`
              relative h-9 w-9 text-sm transition-all duration-150
              ${
                isDisabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "hover:bg-primary-100 cursor-pointer"
              }
              ${
                !isSameMonth(day, monthStart)
                  ? "text-gray-400"
                  : "text-gray-900"
              }
              ${
                isSelected || isRangeStart || isRangeEnd
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : ""
              }
              ${isInRange || isInHoverRange ? "bg-primary-100" : ""}
              ${isRangeStart ? "rounded-l-full" : ""}
              ${isRangeEnd ? "rounded-r-full" : ""}
              ${
                isSelected && !isRangeStart && !isRangeEnd ? "rounded-full" : ""
              }
            `}
              onClick={() => !isDisabled && handleDateClick(cloneDay)}
              onMouseEnter={() => mode === "range" && setHoverDate(cloneDay)}
              disabled={isDisabled}
            >
              {format(day, "d")}
            </button>
          );

          day = addDays(day, 1);
        }
        rows.push(
          <div key={day.toString()} className="grid grid-cols-7 gap-1">
            {days}
          </div>
        );
        days = [];
      }

      return (
        <div className="p-3">
          {/* Month/Year header */}
          {mode === "range" && (
            <div className="mb-2">
              <div className="flex gap-4 justify-center items-center pb-2 border-b border-gray-200">
                <p className="text-sm">
                  {rangeStart
                    ? format(rangeStart, "P", { locale })
                    : "Select start date"}
                </p>
                <p>-</p>
                <p className="text-sm">
                  {rangeEnd
                    ? format(rangeEnd, "P", { locale })
                    : "Select end date"}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="text-sm font-semibold text-gray-900">
              {format(currentMonth, "MMMM yyyy", { locale })}
            </div>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">{daysHeader}</div>

          {/* Calendar grid */}
          {rows}

          {/* Footer actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => handleDateClick(new Date())}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              {i18n.language === "de" ? "Heute" : "Today"}
            </button>
            {(selectedDate || rangeStart || rangeEnd) && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                {i18n.language === "de" ? "Löschen" : "Clear"}
              </button>
            )}
          </div>
        </div>
      );
    };

    const getDisplayValue = () => {
      if (mode === "single") {
        return selectedDate ? format(selectedDate, "P", { locale }) : "";
      } else {
        if (rangeStart && rangeEnd) {
          return `${format(rangeStart, "P", { locale })} - ${format(
            rangeEnd,
            "P",
            { locale }
          )}`;
        } else if (rangeStart) {
          return format(rangeStart, "P", { locale });
        }
        return "";
      }
    };

    return (
      <>
        <div className="relative" ref={containerRef}>
          {label && (
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}

          <div className="relative">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <input
              ref={inputRef}
              type="text"
              readOnly
              value={getDisplayValue()}
              placeholder={
                placeholder ||
                (mode === "single" ? "Select date" : "Select date range")
              }
              onClick={() => !disabled && setIsOpen(!isOpen)}
              className={`
              w-full pl-[4.5rem] pr-4 py-4 text-base font-medium
              bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl
              focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              cursor-pointer shadow-sm hover:shadow hover:border-gray-300
              transition-all placeholder:text-gray-400
              ${disabled ? "bg-gray-100 cursor-not-allowed opacity-50" : ""}
              ${className}
            `}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Dropdown Calendar - Rendered via Portal */}
        {mounted &&
          isOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 min-w-[280px]"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                zIndex: 9999,
              }}
            >
              {renderCalendar()}
            </div>,
            document.body
          )}
      </>
    );
  }
);

export default DatePicker;
