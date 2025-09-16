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
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-300/8 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="text-center relative z-10 animate-scale-in">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow animate-pulse-glow">
            <svg className="w-8 h-8 text-white animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">FleetFlow</h1>
          <p className="text-secondary-600 animate-fade-in-up" style={{animationDelay: '0.3s'}}>Loading your fleet management dashboard...</p>
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-secondary-50/50 via-primary-50/30 to-secondary-100/40 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-300/4 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary-500/3 rounded-full blur-2xl"></div>
      </div>
      
      {/* Header - no animation to prevent flicker */}
      <div className="relative z-20">
        <Header user={user} />
      </div>
      
      <div className="flex relative z-10">
        {/* Sidebar - no animation to prevent flicker */}
        <div>
          <Sidebar items={sidebarItems} userRole={user.role} />
        </div>
        
        {/* Main Content - minimal animation */}
        <main className="flex-1 ml-64 min-h-screen pt-16">
          <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto animate-fade-in" style={{animationDuration: '0.2s'}}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;