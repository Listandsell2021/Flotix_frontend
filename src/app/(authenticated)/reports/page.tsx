'use client';

import { useEffect, useState } from 'react';
import { reportsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { formatCurrency } from '@/lib/utils';
import type { DashboardKPIs, ReportFilters } from '@/types';

export default function ReportsPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingReports, setGeneratingReports] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      const response = await reportsApi.getDashboard();
      if (response.success) {
        setKpis(response.data);
      } else {
        setError(response.message || 'Failed to load report data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (reportType: string, filters: Partial<ReportFilters> = {}) => {
    setGeneratingReports(prev => ({ ...prev, [reportType]: true }));
    
    try {
      const now = new Date();
      let dateFrom: string, dateTo: string;
      
      // Set date ranges based on report type
      switch (reportType) {
        case 'monthly':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
          break;
        case 'quarterly':
          const quarter = Math.floor(now.getMonth() / 3);
          dateFrom = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
          dateTo = new Date(now.getFullYear(), quarter * 3 + 3, 0).toISOString().split('T')[0];
          break;
        case 'annual':
          dateFrom = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
          dateTo = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
          break;
        default:
          // For driver reports, use current month
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      }
      
      const reportFilters: ReportFilters = {
        dateFrom,
        dateTo,
        ...filters
      };
      
      const response = await reportsApi.getSummary(reportFilters);
      
      if (response.success) {
        // Generate and download CSV
        const reportData = response.data;
        const csvContent = generateCSV(reportData, reportType);
        downloadCSV(csvContent, `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        alert('Failed to generate report: ' + (response.message || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('Report generation error:', err);
      alert('Failed to generate report: ' + err.message);
    } finally {
      setGeneratingReports(prev => ({ ...prev, [reportType]: false }));
    }
  };

  const generateCSV = (data: any, reportType: string): string => {
    const { summary, breakdown, chartData } = data;
    
    // All amounts are already in EUR - no conversion needed
    
    let csv = '\ufeff'; // BOM for UTF-8
    csv += `Report Type,${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report\n`;
    csv += `Generated On,${new Date().toLocaleString()}\n`;
    csv += `Currency,EUR\n\n`;
    
    // Summary section
    csv += 'SUMMARY\n';
    csv += 'Metric,Value\n';
    csv += `Total Amount,€${summary.totalAmount.toFixed(2)}\n`;
    csv += `Expense Count,${summary.expenseCount}\n`;
    csv += `Average Amount,€${summary.avgExpenseAmount.toFixed(2)}\n\n`;
    
    // Breakdown section
    if (breakdown && breakdown.length > 0) {
      csv += 'BREAKDOWN\n';
      csv += 'Category,Amount,Count\n';
      breakdown.forEach((item: any) => {
        csv += `"${item.label}",€${item.value.toFixed(2)},${item.count}\n`;
      });
      csv += '\n';
    }
    
    // Chart data section
    if (chartData && chartData.length > 0) {
      csv += 'DAILY DATA\n';
      csv += 'Date,Amount,Count\n';
      chartData.forEach((item: any) => {
        csv += `${item.date},€${item.amount.toFixed(2)},${item.count}\n`;
      });
    }
    
    return csv;
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportData = () => {
    handleGenerateReport('export', { groupBy: 'month' });
  };

  const handleCustomReport = () => {
    // For now, generate a comprehensive report with all data
    handleGenerateReport('custom', { groupBy: 'driver' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading reports...</p>
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
              <h3 className="text-sm font-medium text-red-800">Error Loading Reports</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-2">Comprehensive analytics and reporting for your fleet expenses</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" disabled>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </Button>
            {/* HIDDEN: Export functionality - Re-enable when backend ready */}
            {/* <Button
              variant="outline"
              onClick={handleExportData}
              disabled={generatingReports['export']}
            >
              {generatingReports['export'] ? (
                <Spinner size="sm" className="w-4 h-4 mr-2" />
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              Export Data
            </Button> */}
            <Button 
              onClick={handleCustomReport}
              disabled={generatingReports['custom']}
            >
              {generatingReports['custom'] ? (
                <Spinner size="sm" className="w-4 h-4 mr-2" />
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )}
              Custom Report
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(kpis.totalSpendThisMonth)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Fuel Expenses</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(kpis.fuelVsMiscSplit.fuel)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Miscellaneous</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(kpis.fuelVsMiscSplit.misc)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Month-over-Month</p>
                    <p className={`text-2xl font-bold ${
                      kpis.monthOverMonthTrend.percentageChange >= 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {kpis.monthOverMonthTrend.percentageChange >= 0 ? '+' : ''}
                      {kpis.monthOverMonthTrend.percentageChange.toFixed(1)}%
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    kpis.monthOverMonthTrend.percentageChange >= 0 
                      ? 'bg-red-100' 
                      : 'bg-green-100'
                  }`}>
                    <svg className={`w-6 h-6 ${
                      kpis.monthOverMonthTrend.percentageChange >= 0 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={kpis.monthOverMonthTrend.percentageChange >= 0
                          ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                        } 
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Financial Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Monthly Summary</p>
                    <p className="text-sm text-gray-500">Detailed breakdown of monthly expenses</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleGenerateReport('monthly')}
                    disabled={generatingReports['monthly']}
                  >
                    {generatingReports['monthly'] ? <Spinner size="sm" /> : 'Generate'}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Quarterly Report</p>
                    <p className="text-sm text-gray-500">Comprehensive quarterly analysis</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleGenerateReport('quarterly')}
                    disabled={generatingReports['quarterly']}
                  >
                    {generatingReports['quarterly'] ? <Spinner size="sm" /> : 'Generate'}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Annual Report</p>
                    <p className="text-sm text-gray-500">Full year financial summary</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleGenerateReport('annual')}
                    disabled={generatingReports['annual']}
                  >
                    {generatingReports['annual'] ? <Spinner size="sm" /> : 'Generate'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Driver Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Driver Performance</p>
                    <p className="text-sm text-gray-500">Individual driver expense analysis</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleGenerateReport('driver-performance', { groupBy: 'driver' })}
                    disabled={generatingReports['driver-performance']}
                  >
                    {generatingReports['driver-performance'] ? <Spinner size="sm" /> : 'Generate'}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Top Spenders</p>
                    <p className="text-sm text-gray-500">Identify high-spending drivers</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleGenerateReport('top-spenders', { groupBy: 'driver' })}
                    disabled={generatingReports['top-spenders']}
                  >
                    {generatingReports['top-spenders'] ? <Spinner size="sm" /> : 'Generate'}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Driver Efficiency</p>
                    <p className="text-sm text-gray-500">Cost per mile and efficiency metrics</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleGenerateReport('driver-efficiency', { groupBy: 'driver' })}
                    disabled={generatingReports['driver-efficiency']}
                  >
                    {generatingReports['driver-efficiency'] ? <Spinner size="sm" /> : 'Generate'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Fuel</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {kpis ? formatCurrency(kpis.fuelVsMiscSplit.fuel) : '$0.00'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">Miscellaneous</p>
                  <p className="text-2xl font-bold text-green-600">
                    {kpis ? formatCurrency(kpis.fuelVsMiscSplit.misc) : '$0.00'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Total</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {kpis ? formatCurrency(kpis.fuelVsMiscSplit.fuel + kpis.fuelVsMiscSplit.misc) : '$0.00'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}