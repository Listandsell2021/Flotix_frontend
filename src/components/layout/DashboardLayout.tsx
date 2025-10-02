'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import Sidebar, { adminSidebarItems, superAdminSidebarItems } from './Sidebar';
import { authApi } from '@/lib/api';
import Spinner from '@/components/ui/Spinner';

interface User {
  name: string;
  email: string;
  role: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authCheck, setAuthCheck] = useState(0); // Force re-check trigger

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authApi.getMe();
        setUser(userData);
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, authCheck]);

  // Listen for storage changes (token changes from impersonation)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' || e.key === 'currentUser') {
        // Token or user changed, trigger re-auth check
        setLoading(true);
        setAuthCheck(prev => prev + 1);
      }
    };

    const handleUserChange = () => {
      // Custom event from impersonation context
      setLoading(true);
      setAuthCheck(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userChanged', handleUserChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChanged', handleUserChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-gray-500 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const sidebarItems = user.role === 'SUPER_ADMIN' 
    ? superAdminSidebarItems 
    : adminSidebarItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative z-20">
        <Header user={user} />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div>
          <Sidebar items={sidebarItems} userRole={user.role} />
        </div>

        {/* Main Content - with stable height to prevent bouncing */}
        <main className="flex-1 ml-64 pt-16" style={{ minHeight: '100vh' }}>
          <div className="p-6 lg:p-8 h-full">
            <div className="max-w-7xl mx-auto" style={{ minHeight: 'calc(100vh - 10rem)' }}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;