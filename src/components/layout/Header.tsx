'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="layout-stable fixed top-0 right-0 left-64 z-30 bg-white/85 backdrop-blur-xl border-b border-secondary-200/50 shadow-soft">
      <div className="px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Page Title Area - Will be dynamically set */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-medium animate-bounce-gentle">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-lg font-semibold text-secondary-900">Flotix</h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center max-w-md mx-auto">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search fleet, drivers, expenses..."
                className="block w-full pl-10 pr-3 py-2.5 border border-secondary-200/50 rounded-xl bg-white/60 backdrop-blur-sm text-sm placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white/80 focus:shadow-glow transition-all duration-300 hover:border-primary-300 hover:bg-white/70"
              />
              <div className="absolute inset-0 rounded-xl bg-shimmer bg-[length:200%_100%] opacity-0 group-focus-within:opacity-100 group-focus-within:animate-shimmer transition-opacity pointer-events-none"></div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2.5 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100/50 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-medium group">
                <svg className="w-5 h-5 group-hover:animate-wiggle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.405-3.405A6.5 6.5 0 0118 10c0-3.314-2.686-6-6-6s-6 2.686-6 6a6.5 6.5 0 001.405 4.595L6 17h5m4 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full animate-pulse"></div>
            </div>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-secondary-100/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 hover:shadow-medium group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-medium group-hover:shadow-glow group-hover:scale-110 transition-all duration-300">
                    <span className="text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium text-secondary-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {user.role.replace('_', ' ').toLowerCase()}
                    </p>
                  </div>
                  <svg
                    className={cn(
                      "w-4 h-4 text-secondary-400 transition-transform",
                      showDropdown && "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-xl shadow-large border border-secondary-200/50 py-2 z-50">
                    <div className="px-4 py-3 border-b border-secondary-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-medium">
                          <span className="text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-secondary-900">{user.name}</p>
                          <p className="text-xs text-secondary-500">{user.email}</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 mt-1">
                            {user.role.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile Settings
                      </Link>
                      
                      <Link
                        href="/help"
                        className="flex items-center px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Help & Support
                      </Link>
                    </div>

                    <div className="border-t border-secondary-100 pt-2">
                      <button
                        onClick={handleLogout}
                        disabled={loading}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-accent-600 hover:bg-accent-50 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4 mr-3 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {loading ? 'Signing out...' : 'Sign out'}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Overlay to close dropdown */}
                {showDropdown && (
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowDropdown(false)}
                  />
                )}
              </div>
            ) : (
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;