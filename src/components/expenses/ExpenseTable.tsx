'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { User, Expense } from '@/types';

interface ExpenseWithDriver extends Omit<Expense, 'driverId'> {
  driverId: User | string;
}

interface ExpenseTableProps {
  expenses: ExpenseWithDriver[];
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onViewExpense: (expense: ExpenseWithDriver) => void;
  onEditExpense: (expense: ExpenseWithDriver) => void;
  loading?: boolean;
}

type SortField = 'merchant' | 'driver' | 'date' | 'amount' | 'type';
type SortDirection = 'asc' | 'desc';

export default function ExpenseTable({
  expenses,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  onViewExpense,
  onEditExpense,
  loading,
}: ExpenseTableProps) {
  const { t } = useTranslation('expenses');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const getDriverName = (driverId: User | string): string => {
    if (typeof driverId === 'string') return t('table.unknown');
    return driverId?.name || t('table.unknown');
  };

  const getTypeBadgeVariant = (type: string): 'info' | 'secondary' => {
    return type === 'FUEL' ? 'info' : 'secondary';
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort expenses
  const processedExpenses = expenses.sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'merchant':
        comparison = (a.merchant || '').localeCompare(b.merchant || '');
        break;
      case 'driver':
        comparison = getDriverName(a.driverId).localeCompare(getDriverName(b.driverId));
        break;
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'amount':
        comparison = a.amountFinal - b.amountFinal;
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="p-5 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-40 animate-pulse"></div>
            <div className="h-3 w-3 bg-primary-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="p-5">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-xl border-2 border-gray-100"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
        <div className="p-5 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50">
          <h3 className="text-base font-bold text-gray-900">{t('table.allExpenses')}</h3>
        </div>
        <div className="p-8">
          <div className="text-center py-12">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <svg
                className="w-10 h-10 text-gray-400"
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
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {t('table.noExpenses')}
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              {t('table.noExpensesMessage')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900">{t('table.allExpenses')}</h3>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-700 font-semibold">{t('table.showing')}</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-semibold text-gray-700 bg-white hover:border-gray-300 transition-all cursor-pointer shadow-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>
      <div className="p-4">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto -mx-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50">
                {/* Merchant Column */}
                <th className="px-4 py-3">
                  <button
                    onClick={() => handleSort('merchant')}
                    className="flex items-center space-x-2 text-left w-full group hover:text-primary-600 transition-colors"
                  >
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider group-hover:text-primary-600">
                      {t('modal.merchant')}
                    </span>
                    <div className="flex flex-col">
                      <svg className={`w-3 h-3 -mb-1 transition-colors ${sortField === 'merchant' && sortDirection === 'asc' ? 'text-primary-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" transform="rotate(180 10 10)" />
                      </svg>
                      <svg className={`w-3 h-3 transition-colors ${sortField === 'merchant' && sortDirection === 'desc' ? 'text-primary-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </button>
                </th>

                {/* Driver Column */}
                <th className="px-4 py-3">
                  <button
                    onClick={() => handleSort('driver')}
                    className="flex items-center space-x-2 text-left w-full group hover:text-primary-600 transition-colors"
                  >
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider group-hover:text-primary-600">
                      {t('modal.driver')}
                    </span>
                    <div className="flex flex-col">
                      <svg className={`w-3 h-3 -mb-1 transition-colors ${sortField === 'driver' && sortDirection === 'asc' ? 'text-primary-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" transform="rotate(180 10 10)" />
                      </svg>
                      <svg className={`w-3 h-3 transition-colors ${sortField === 'driver' && sortDirection === 'desc' ? 'text-primary-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </button>
                </th>

                {/* Date Column */}
                <th className="px-4 py-3">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center space-x-2 text-left w-full group hover:text-primary-600 transition-colors"
                  >
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider group-hover:text-primary-600">
                      {t('modal.date')}
                    </span>
                    <div className="flex flex-col">
                      <svg className={`w-3 h-3 -mb-1 transition-colors ${sortField === 'date' && sortDirection === 'asc' ? 'text-primary-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" transform="rotate(180 10 10)" />
                      </svg>
                      <svg className={`w-3 h-3 transition-colors ${sortField === 'date' && sortDirection === 'desc' ? 'text-primary-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </button>
                </th>

                {/* Amount Column */}
                <th className="px-4 py-3">
                  <button
                    onClick={() => handleSort('amount')}
                    className="flex items-center space-x-2 text-left w-full group hover:text-primary-600 transition-colors"
                  >
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider group-hover:text-primary-600">
                      {t('modal.amount')}
                    </span>
                    <div className="flex flex-col">
                      <svg className={`w-3 h-3 -mb-1 transition-colors ${sortField === 'amount' && sortDirection === 'asc' ? 'text-primary-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" transform="rotate(180 10 10)" />
                      </svg>
                      <svg className={`w-3 h-3 transition-colors ${sortField === 'amount' && sortDirection === 'desc' ? 'text-primary-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </button>
                </th>

                {/* Type Column */}
                <th className="px-4 py-3">
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center space-x-2 text-left w-full group hover:text-primary-600 transition-colors"
                  >
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider group-hover:text-primary-600">
                      {t('modal.type')}
                    </span>
                    <div className="flex flex-col">
                      <svg className={`w-3 h-3 -mb-1 transition-colors ${sortField === 'type' && sortDirection === 'asc' ? 'text-primary-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" transform="rotate(180 10 10)" />
                      </svg>
                      <svg className={`w-3 h-3 transition-colors ${sortField === 'type' && sortDirection === 'desc' ? 'text-primary-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </button>
                </th>

                {/* Actions Column */}
                <th className="px-4 py-3 text-right">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {processedExpenses.map((expense) => (
                <tr
                  key={expense._id}
                  className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all group border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="relative w-9 h-9 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center mr-3 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {expense.merchant || t('table.unknownMerchant')}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-7 h-7 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center mr-2">
                        <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        {getDriverName(expense.driverId)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mr-2">
                        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        {formatDate(expense.date)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-7 h-7 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center mr-2">
                        <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(expense.amountFinal)} {expense.currency}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge variant={getTypeBadgeVariant(expense.type)}>
                      {t(`types.${expense.type}`)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        onClick={() => onViewExpense(expense)}
                        variant="ghost"
                        size="sm"
                        className="text-xs hover:bg-primary-50 hover:text-primary-700 transition-all"
                      >
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {t('table.view')}
                      </Button>
                      <Button
                        onClick={() => onEditExpense(expense)}
                        variant="ghost"
                        size="sm"
                        className="text-xs hover:bg-indigo-50 hover:text-indigo-700 transition-all"
                      >
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {t('table.edit')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {processedExpenses.map((expense) => (
            <div
              key={expense._id}
              className="relative overflow-hidden border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-primary-300 transition-all bg-gradient-to-br from-white via-gray-50 to-white"
            >
              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500"></div>

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center mr-3 shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-gray-900">
                      {expense.merchant || t('table.unknownMerchant')}
                    </h4>
                    <div className="flex items-center mt-1">
                      <div className="w-5 h-5 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded flex items-center justify-center mr-1.5">
                        <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">
                        {getDriverName(expense.driverId)}
                      </p>
                    </div>
                  </div>
                </div>
                <Badge variant={getTypeBadgeVariant(expense.type)}>
                  {t(`types.${expense.type}`)}
                </Badge>
              </div>

              <div className="flex items-center justify-between mb-3 pt-3 border-t-2 border-gray-100">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mr-2">
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{formatDate(expense.date)}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center mr-2">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-base font-bold text-gray-900">
                    {formatCurrency(expense.amountFinal)} {expense.currency}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => onViewExpense(expense)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs font-semibold hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 transition-all"
                >
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {t('table.view')}
                </Button>
                <Button
                  onClick={() => onEditExpense(expense)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs font-semibold hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-all"
                >
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t('table.edit')}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-6 pt-5 border-t-2 border-gradient-to-r from-gray-100 via-gray-200 to-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-sm text-gray-700 font-semibold">
              {t('table.showingResults', {
                start: startIndex,
                end: endIndex,
                total: totalItems,
              })}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="text-xs font-semibold hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-300 transition-all"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('table.previous')}
            </Button>

            <div className="flex items-center space-x-1.5">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-bold transition-all ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white shadow-md hover:shadow-lg scale-105'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <Button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="text-xs font-semibold hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-300 transition-all"
            >
              {t('table.next')}
              <svg className="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
