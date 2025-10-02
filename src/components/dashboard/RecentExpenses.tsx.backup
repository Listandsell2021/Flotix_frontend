import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

interface Expense {
  id: string;
  driverName: string;
  amount: number;
  currency: string;
  type: 'FUEL' | 'MISC';
  category?: string;
  merchant?: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
}

interface RecentExpensesProps {
  expenses: Expense[];
  loading?: boolean;
  totalExpenses?: number; // Total number of expenses in system
}

const RecentExpenses: React.FC<RecentExpensesProps> = ({ expenses, loading, totalExpenses }) => {
  const getTypeIcon = (type: string) => {
    return type === 'FUEL' ? '⛽' : '📄';
  };

  const getStatusBadge = (status: string) => {
    if (!status) return null;
    
    const variants = {
      approved: 'success' as const,
      pending: 'warning' as const,
      rejected: 'danger' as const,
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'} size="sm">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-4 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-glow transition-all duration-500 hover:-translate-y-1 h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Recent Expenses
          </div>
          {expenses.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-secondary-500">
                Showing {expenses.length} {totalExpenses ? `of ${totalExpenses}` : 'recent'}
              </span>
              {totalExpenses && totalExpenses > expenses.length && (
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8 animate-fade-in" style={{animationDuration: '0.2s'}}>
            <div className="w-16 h-16 bg-gradient-to-br from-secondary-100 to-secondary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-gentle shadow-soft">
              <div className="text-2xl animate-float">📄</div>
            </div>
            <p className="text-secondary-600 font-medium mb-2">No recent expenses</p>
            <p className="text-secondary-500 text-sm">Expense receipts will appear here</p>
            <button className="mt-4 inline-flex items-center px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-all duration-300 hover:scale-105 shadow-soft hover:shadow-glow">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Expense
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="group relative flex items-center justify-between p-4 bg-secondary-50/50 hover:bg-white/80 rounded-xl transition-all duration-300 border border-secondary-200/30 hover:border-primary-300/50 hover:shadow-medium hover:-translate-y-1 animate-fade-in overflow-hidden" style={{animationDuration: '0.15s', animationDelay: `${0.05 + expenses.indexOf(expense) * 0.02}s`}}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow group-hover:scale-110 transition-all duration-300 group-hover:rotate-3">
                    <span className="text-lg group-hover:animate-bounce-gentle">{getTypeIcon(expense.type)}</span>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-secondary-900 group-hover:text-primary-700 transition-colors duration-300">{expense.driverName}</p>
                      {getStatusBadge(expense.status)}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-secondary-500 group-hover:text-secondary-600 transition-colors duration-300">
                      <span>{expense.type}</span>
                      {expense.category && (
                        <>
                          <span>•</span>
                          <span>{expense.category}</span>
                        </>
                      )}
                      {expense.merchant && (
                        <>
                          <span>•</span>
                          <span>{expense.merchant}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-secondary-900 text-lg group-hover:text-primary-700 transition-colors duration-300 animate-counter-up">
                    {formatCurrency(expense.amount, expense.currency)}
                  </p>
                  <p className="text-xs text-secondary-500 mt-1 group-hover:text-secondary-600 transition-colors duration-300">
                    {formatDate(expense.date)}
                  </p>
                </div>
                
                {/* Animated progress indicator */}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 group-hover:w-full transition-all duration-500 rounded-b-xl"></div>
              </div>
            ))}
          </div>
        )}
        
        {expenses.length > 0 && totalExpenses && totalExpenses > expenses.length && (
          <div className="pt-4 border-t border-secondary-200/30 animate-fade-in" style={{animationDuration: '0.2s', animationDelay: '0.15s'}}>
            <button 
              onClick={() => window.location.href = '/expenses'}
              className="group w-full flex items-center justify-center p-3 bg-gradient-to-r from-primary-50 to-primary-100/50 hover:from-primary-100 hover:to-primary-200/50 border border-primary-200/50 rounded-xl transition-all duration-300 hover:shadow-medium hover:-translate-y-0.5"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-soft group-hover:shadow-glow group-hover:scale-110 transition-all duration-300">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h.01M9 12h.01M9 16h.01M13 8h2M13 12h2M13 16h2" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-primary-700 group-hover:text-primary-800 transition-colors duration-300">
                    View All Expenses
                  </p>
                  <p className="text-xs text-primary-600 group-hover:text-primary-700 transition-colors duration-300">
                    {totalExpenses} expenses total
                  </p>
                </div>
                <svg className="w-4 h-4 text-primary-500 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentExpenses;